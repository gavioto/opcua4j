/*    Test 5.9.4 Test9 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
        Specify a valid SubscriptionId (subscription created with default parameters),
        TriggeringItemId (MonitoringMode is reporting) and one valid LinksToAdd (mode is sampling).
        Call Publish; Write a value to the triggeringItem. Call Publish. Write another value to
        the triggering item and then call Publish. Write values to the linked (triggered) items
        only and then call Publish. Write to the triggering item and then call Publish.

      Expected Results:
        All service and operation level results are Good.
        The 1st Publish call yields data for all of the items.
        The 2nd Publish call yields data for the triggering Item only.
        The 3rd  Publish call yields data for the triggering item only.
        The 4th Publish call yields no data.
        The 5th Publish call yields a dataChange for the triggering and linked item.

      Revision History:
        Jun-25-2010 NP: Initial version.
        Dec-20-2010 MI: Triggered items are not necessarily all included in the first Publish.
*/

function setTriggering594009()
{
    const TRIGGERINGITEM_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32";
    const TRIGGEREDITEM_SETTINGS = [
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Float"
        ];

    // create the monitoredItems
    var triggeringItem = MonitoredItem.fromSetting ( TRIGGERINGITEM_SETTING, 0, Attribute.Value, "", MonitoringMode.Reporting,true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItems = MonitoredItem.fromSettings( TRIGGEREDITEM_SETTINGS, 1, Attribute.Value, "", MonitoringMode.Sampling, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var i;
    
    if( triggeringItem == null || addLinkedItems == null || addLinkedItems.length < 4 )
    {
        addSkipped( "Static Scalar (Int16, UInt16, Int32, UInt32, Float)" );
        return;
    }

    if( !MonitorTriggeringSubscription.SubscriptionCreated )
    {
        addError( "Subscription for conformance unit Monitor Value Change was not created." );
        return;
    }

    // consolidate ALL of the monitoredItems into 1 collection to pass to Create/DeleteMonitoredItems
    var monitoredItems = Array( triggeringItem );
    monitoredItems = monitoredItems.concat( addLinkedItems );

    // read the items first, then we can set new values for them reliably, i.e. value += 1
    addLog( "Reading the triggering and linked items first to obtain their current value." );
    ReadHelper.Execute( monitoredItems );

    // function createMonitoredItems( MonitoredItems, TimestampsToReturn, Subscription, Session, ExpectedResults, ExpectErrorNotFail )
    if( createMonitoredItems( monitoredItems, TimestampsToReturn.Both, MonitorTriggeringSubscription, g_session ) )
    {
        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, addLinkedItems ) )
        {
            // publish #1.1
            addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #1." );
            wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Publish #1 Expected to receive at least one data-change for the triggering item." ) )
            {
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
                                addError( "Received unexpected datachange for item " + addLinkedItems[i].NodeSetting );
                            }
                            else
                            {
                                handlesReceived.insert(addLinkedItems[i].ClientHandle);
                                addLog( "Received datachange for item " + addLinkedItems[i].NodeSetting );
                            }
                        }
                        // handle is not included in datachange
                        else
                        {
                            if(!handlesReceived.contains(addLinkedItems[i].ClientHandle))
                            {
                                addError( "No datachange received for item " + addLinkedItems[i].NodeSetting );
                            }
                        }
                    }
                }
            }


            // publish #2 and 3 (write to trigger only)
            for( var r=0; r<2; r++ )
            {
                triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
                if( WriteHelper.Execute( triggeringItem ), "Expected write to succeed in order to test triggering." )
                {
                    addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #" + (2 + r) + ". We expect only the trigger's value change to be received!" );
                    wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                    PublishHelper.Execute();
                    if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a data-change for both items since the trigger is now invalidated and both itemns should be operating as normal." ) )
                    {
                        AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive dataChange notifications for the trigger only! (its the only node whose value has changed!)" );
                        AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "Did not find TRIGGERING item '" + triggeringItem.NodeSetting + "' in Publish response (mode=Sampling)." );
                    }
                    addLog( "Publish " + ( 2 + r ) + " received and checked for both triggering and linked nodes." );
                }//write
            }// repeat trigger write with publish check, twice!



            // publish #4 (write to links only)
            for( var l=0; l<addLinkedItems.length; l++ )
            {
                addLinkedItems[l].SafelySetValueTypeKnown( addLinkedItems[l].Value.Value + 1, NodeIdSettings.guessType( addLinkedItems[l].NodeSetting ) );
            }// for l...
            if( WriteHelper.Execute( addLinkedItems ), "Expected write to succeed in order to test triggering." )
            {
                addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #4 and we will expect notifications from all nodes." );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                PublishHelper.Execute();
                AssertFalse( PublishHelper.CurrentlyContainsData(), "Did NOT expect to receive any data-changes." );
                addLog( "Publish 4 received and checked for both triggering and linked nodes." );
            }//write


            // publish #5
            triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
            if( WriteHelper.Execute( triggeringItem ), "Expected write to succeed in order to test triggering." )
            {
                addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #5." );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                PublishHelper.Execute();
                if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a data-change for all items since the trigger is now invoked and all linked items are Sampling and therefore eligible for inclusion within the Publish response." ) )
                {
                    if( !AssertEqual( monitoredItems.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive " + monitoredItems.length + " notifications, the trigger!" ) )
                    {
                        addError( "Received the following datachanges: " + PublishHelper.PrintDataChanges( true ) );
                    }
                    AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "Did not find TRIGGERING item '" + triggeringItem.NodeSetting + "' in Publish response (mode=Sampling)." );
                    for( var i=0; i<addLinkedItems.length; i++ )
                    {
                        AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItems[i].ClientHandle ), "Did not find LINKED item '" + addLinkedItems[i].NodeSetting + "' (ClientHandle: " + addLinkedItems[i].ClientHandle + ") in Publish response (mode=Sampling)." );
                    }
                }
                addLog( "Publish #5 received and checked for both triggering and linked nodes." );
            }//write
        }// setTriggering.Execute(); initial adding of 2 items
    }

    // clean-up
    deleteMonitoredItems( monitoredItems, MonitorTriggeringSubscription, g_session );
}

safelyInvoke( setTriggering594009 );