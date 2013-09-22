/*    Test 5.9.4 Test 11 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
            Specify a valid SubscriptionId (subscription created with default parameters),
            TriggeringItemId (MonitoringMode is reporting) and multiple valid LinksToAdd
            (2 items are reporting, 2 are sampling).
            Call Publish. Write a value to the triggeringItem. Call Publish.
            Write a value to 1xreporting and 1xsampling linked nodes and then call Publish.
            Write a value to the triggering item only and call Publish.

      Expected Results:
            All service and operation level results are Good.
            The 1st Publish yields data for all items.
            The 2nd Publish yields data for the triggering item only.
            The 3rd Publish yields data for the reporting node only.
            The 4th Publish yields data for the triggering node and the linked sampling item previously written to.

      Revision History:
        Oct-21-2009 NP: Initial version.
        Nov-24-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support Triggering.
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
        Jun-21-2010 NP: Revised to match new test-case requirements.
        Dec-20-2010 MI: Triggered items are not necessarily all included in the first Publish.
*/

function setTriggering594011()
{
    const TRIGGERINGITEM_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32";
    const TRIGGEREDITEM_SETTINGS = [
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Float"
        ];

    // create the monitoredItems, triggering and 2links = Reporting; 2 links = Sampling
    var triggeringItem = MonitoredItem.fromSetting ( TRIGGERINGITEM_SETTING, 0, Attribute.Value, "", MonitoringMode.Reporting, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItems = MonitoredItem.fromSettings( TRIGGEREDITEM_SETTINGS, 1, Attribute.Value, "", MonitoringMode.Reporting, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    if( triggeringItem == null || addLinkedItems == null || addLinkedItems.length < 4 )
    {
        addSkipped( "Static Scalar (Int16, UInt16, Int32, UInt32, Float)" );
        return;
    }
    addLinkedItems[0].MonitoringMode = MonitoringMode.Sampling;
    addLinkedItems[1].MonitoringMode = MonitoringMode.Sampling;

    if( !MonitorTriggeringSubscription.SubscriptionCreated )
    {
        addError( "Subscription for conformance unit Monitor Value Change was not created." );
        return;
    }

    // consolidate ALL of the monitoredItems into 1 collection to pass to Create/DeleteMonitoredItems
    var monitoredItems = Array( triggeringItem );
    monitoredItems = monitoredItems.concat( addLinkedItems );

    // function createMonitoredItems( MonitoredItems, TimestampsToReturn, Subscription, Session, ExpectedResults, ExpectErrorNotFail )
    if( createMonitoredItems( monitoredItems, TimestampsToReturn.Both, MonitorTriggeringSubscription, g_session ) )
    {
        // read all items so that we can get their current values
        addLog( "Reading the triggering and linked items first to obtain their current value." );
        ReadHelper.Execute( monitoredItems );

        // set-up the triggering service call
        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, addLinkedItems ) )
        {
            // publish #1.1
            addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #1." );
            wait( MonitorTriggeringSubscription.RevisedPublishingInterval );

            // first Publish and we expect dataChanges for all items that are reporting
            PublishHelper.Execute();
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Publish #1 Expected to receive at least one data-change for the triggering item." ) )
            {
                // check for triggering item
                AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "Expected 1st Publish call to yield data for TRIGGERING item!" );
                
                var handlesReceived = new IntegerSet;
                    
                // check for triggered items
                for( i = 0;  i < addLinkedItems.length; i++ )
                {
                    if( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItems[i].ClientHandle ) )
                    {
                        addLog("Received datachange for item " + addLinkedItems[i].NodeSetting);
                        handlesReceived.insert(addLinkedItems[i].ClientHandle);
                    }
                }
                
                // items that are set to reporting have to be included in datachange
                AssertTrue( handlesReceived.contains( addLinkedItems[2].ClientHandle ), "Expected 1st Publish call to yield data for TRIGGERING item!" );

                // write to triggering item if we didn't get values for all triggered items
                if(handlesReceived.size() < monitoredItems.length - 1)
                {
                    var monitoredItemsTemp = [];
                    monitoredItemsTemp[0] = monitoredItems[0];

                    // write value to triggering item
                    var newValue = (1 + monitoredItemsTemp[0].Value.Value );
                    monitoredItemsTemp[0].SafelySetValueTypeKnown( newValue, NodeIdSettings.guessType( monitoredItemsTemp[0].NodeSetting ) );

                    AssertTrue( WriteHelper.Execute( monitoredItemsTemp ), "Writes are needed in order to test the trigger." );

                    // publish #1.2
                    PublishHelper.Execute();

                    // we expect the triggering item plus all triggered items we didn't get in the last publish 
                    AssertEqual( monitoredItems.length - handlesReceived.size(), PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected " + monitoredItems.length - handlesReceived.size() +  " values in datachange, received " + PublishHelper.CurrentDataChanges[0].MonitoredItems.length + "." )

                    // check handles
                    for( i = 0; i < addLinkedItems.length; i++)
                    {
                        // handle is included in datachange
                        if(PublishHelper.HandleIsInCurrentDataChanges( addLinkedItems[i].ClientHandle ))
                        {
                            if(handlesReceived.contains(addLinkedItems[i].ClientHandle))
                            {
                                addError("Received unexpected datachange for item " + addLinkedItems[i].NodeSetting);
                            }
                            else
                            {
                                handlesReceived.insert(addLinkedItems[i].ClientHandle);
                                addLog("Received datachange for item " + addLinkedItems[i].NodeSetting);
                            }
                        }
                        // handle is not included in datachange
                        else
                        {
                            if(!handlesReceived.contains(addLinkedItems[i].ClientHandle))
                            {
                                addError("No datachange received for item " + addLinkedItems[i].NodeSetting);
                            }
                        }
                    }
                }
            }

            // write to the triggeringItem and call Publish, expect Trigger item only
            triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
            if( AssertTrue( WriteHelper.Execute( triggeringItem ), "Expected write to succeed in order to test triggering." ) )
            {
                // wait one publishing cycle before calling publish
                addLog( "Checking for triggering item being received in Publish #2" );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                // call Publish() and see what we receive....
                if( PublishHelper.Execute() )
                {
                    if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a data change." ) )
                    {
                        // we expect 1 monitoredItem to be received: 1 x TriggeringItem.
                        AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 notifications: 1 x TriggeringItem." );
                        AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "Did not find TRIGGERING item '" + triggeringItem.NodeSetting + "' in Publish response (mode=Reporting)." );
                    }// if assertEqual
                }// publish.Execute()
            }// write.Execute()
            
            // write to 2 linked items where 1 x reporting and 1 x sampling, then call Publish 
            addLinkedItems[0].SafelySetValueTypeKnown( addLinkedItems[0].Value.Value + 1, addLinkedItems[0].DataType ); //sampling
            addLinkedItems[2].SafelySetValueTypeKnown( addLinkedItems[2].Value.Value + 1, addLinkedItems[2].DataType ); //reporting
            if( WriteHelper.Execute( [addLinkedItems[0], addLinkedItems[2]] ) )
            {
                // wait one publishing cycle before calling publish
                addLog( "Checking for all some items being received in Publish #3" );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                // call Publish() and see what we receive....
                if( PublishHelper.Execute() )
                {
                    if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a data change." ) )
                    {
                        // we expect 1 monitoredItem to be received: 1 x Sampling links.
                        AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 notifications: 1 x Sampling links." );
                        AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItems[2].ClientHandle ), "Did not find LINKED item '" + addLinkedItems[0].NodeSetting + "' in Publish response (mode=Reporting)." );
                    }// if assertEqual
                }// publish.Execute()
            }
            
            // 4th publish; write to triggering only
            triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
            if( WriteHelper.Execute( triggeringItem ) )
            {
                // wait one publishing cycle before calling publish
                addLog( "Checking for all 1 items being received in Publish #4" );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                // call Publish() and see what we receive....
                if( PublishHelper.Execute() )
                {
                    if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a data change." ) )
                    {
                        // we expect 2 monitoredItem to be received: 1 x Triggering and 1 x Sampling links.
                        AssertEqual( 2, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 notifications: 1 x Triggering item." );
                        AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "Did not find TRIGGERING item '" + triggeringItem.NodeSetting + "' in Publish response (mode=Reporting)." );
                        AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItems[0].ClientHandle ), "Did not find LINKED item '" + addLinkedItems[0].NodeSetting + "' in Publish response (mode=Sampling)." );
                    }// if assertEqual
                }// publish.Execute()
            }
        }// setTriggering.Execute()
    }
    else
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
    }

    // clean-up
    deleteMonitoredItems( monitoredItems, MonitorTriggeringSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( setTriggering594011 );