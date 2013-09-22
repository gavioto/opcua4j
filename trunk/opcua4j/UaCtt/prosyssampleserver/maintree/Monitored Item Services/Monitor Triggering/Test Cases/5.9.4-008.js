/*    Test 5.9.4 Test 8 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
        Create a triggering item whose MonitoringMode is Reporting while adding one linked item.
        Call SetTriggering again and specify multiple items for LinksToAdd and multiple valid items
        for LinksToDelete (all are configured with mode=Sampling). Also specify one item (monitoring
        the same NodeId used by an item previously added) to be specified in both parameters.
        Call Publish.
        Write to the all items and then call Publish.

      Expected Results:
        All service and operation level results are Good.
        The 1st Publish has to yield data-changes for the triggering item
        The 1st Publish can yield data-changes for all triggered items
        The 2nd Publsih has to yield data-changes for all triggered items that were not included in the 1st Publish
        The 3nd/2nd Publish call yields data for the triggering node and all linked nodes previously
        added EXCEPT for the node that was also specified in the LinksToDelete parameter.

      Revision History:
        Oct-21-2009 NP: Initial version.
        Nov-25-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support Triggering!
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
        Jul-09-2010 NP: Revised test-case/script to epect all items to be received in last Publish call because
                        an item specified in both Add/Delete parameters (of SetTriggering) will be processed in
                        the following order: Delete; Add.
        Jul-19-2010 NP: Corrected script engine to concat 1+value as string instead of doing actual calc.
        Dec-20-2010 MI: Triggered items are not necessarily all included in the 1st Publish.
*/

function setTriggering594008()
{
    const TRIGGERINGITEM_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32";
    const TRIGGEREDITEM_SETTINGS = [
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Float"
        ];

    // create the monitoredItems
    var triggeringItem = MonitoredItem.fromSetting ( TRIGGERINGITEM_SETTING, 0, Attribute.Value, "", MonitoringMode.Reporting,true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItems = MonitoredItem.fromSettings( TRIGGEREDITEM_SETTINGS, 1, Attribute.Value, "", MonitoringMode.Sampling, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var i;

    if( triggeringItem == null || addLinkedItems == null || addLinkedItems.length < 4 )
    {
        addSkipped( "Static Scalar (Byte, Int16, UInt16, Int32, Float)" );
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
        // set-up the triggering service call to add just 2 of the items specified
        // in the addLinkedItems. This helps us to set the stage so that we can do 
        // what the test ACTUALLY wants to do in a moment... i.e. call setTriggering 
        // specifying add and delete items in the same call...
        var initialItemsToAdd = [ addLinkedItems[0], addLinkedItems[1] ]; // use this again later as the linksToRemove
        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, initialItemsToAdd ) )
        {
            // now to ACTUALLY do our test, we'll put the first item in here
            // also, because we need one item to duplicate in Add and Remove 
            var remainingItemsToAdd = [ addLinkedItems[2], addLinkedItems[3], addLinkedItems[0] ];
            var itemsToRemove = addLinkedItems[0];
            if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, remainingItemsToAdd, itemsToRemove ) )
            {
                addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling 1st Publish #1..." );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                
                // call Publish (#1) we expect value for the triggering item - the triggered items CAN be included as well
                PublishHelper.Execute();
                
                if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Publish #1 Expected to receive at least one datachange for the triggering item." ) )
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
                    
                    // write to triggering item if we didn't get values for all triggered items
                    if(handlesReceived.size() < monitoredItems.length - 1)
                    {
                        var monitoredItemsTemp = [];
                        monitoredItemsTemp[0] = monitoredItems[0];
                        
                        // write value to triggering item
                        var newValue = (1 + monitoredItemsTemp[0].Value.Value );
                        monitoredItemsTemp[0].SafelySetValueTypeKnown( newValue, NodeIdSettings.guessType( monitoredItemsTemp[0].NodeSetting ) );
                        
                        AssertTrue( WriteHelper.Execute( monitoredItemsTemp ), "Writes are needed in order to test the trigger." );
                        
                        // publish #2
                        PublishHelper.Execute();
                        
                        // we expect the triggering item plus all triggered items we didn't get in the last publish 
                        AssertEqual( monitoredItems.length - handlesReceived.size(), PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected " + monitoredItems.length - handlesReceived.size() +  " values in datachange, received " + PublishHelper.CurrentDataChanges[0].MonitoredItems.length + "." )
                        
                        // check handles
                        for( i = 0; i < addLinkedItems.length; i++)
                        {
                            // handle is included in datachange
                            if( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItems[i].ClientHandle ) )
                            {
                                if( handlesReceived.contains(addLinkedItems[i].ClientHandle) )
                                {
                                    addError( "Received unexpected datachange for item " + addLinkedItems[i].NodeSetting );
                                }
                                else
                                {
                                    handlesReceived.insert( addLinkedItems[i].ClientHandle );
                                    addLog( "Received datachange for item " + addLinkedItems[i].NodeSetting );
                                }
                            }
                            // handle is not included in datachange
                            else
                            {
                                if( !handlesReceived.contains( addLinkedItems[i].ClientHandle ) )
                                {
                                    addError( "No datachange received for item " + addLinkedItems[i].NodeSetting );
                                }
                            }
                        }
                    }
                }

                // now to write to all items and call Publish again
                print( "About to write new Values to all MonitoredItems:" );
                for( var i=0; i<monitoredItems.length; i++ )
                {
                    var newValue = (1 + monitoredItems[i].Value.Value );
                    print( "\tChanging value from '" + monitoredItems[i].Value.Value + "' to '" + newValue + "' for Node: " + monitoredItems[i].NodeSetting );
                    monitoredItems[i].SafelySetValueTypeKnown( newValue, NodeIdSettings.guessType( monitoredItems[i].NodeSetting ) );
                }// for i
                if( AssertTrue( WriteHelper.Execute( monitoredItems ), "Writes are needed in order to test the trigger." ) )
                {
                    addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling 2nd Publish..." );
                    wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                    // call Publish (#2 or #3) we expect values for all nodes
                    PublishHelper.Execute();
                    if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange for " + (monitoredItems.length - 1) + " items (triggering and linked, except for the linked item that has been deleted)." ) )
                    {
                        addLog( "Checking for '" + (monitoredItems.length) + "' items in the 2nd Publish response. Actual: " + PublishHelper.CurrentDataChanges[0].MonitoredItems.length );
                        if( AssertEqual( monitoredItems.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive " + (monitoredItems.length - 1) + " data changes only! 1 x Triggering item and " + (monitoredItems.length - 2) + " x Linked items." ) )
                        {
                            AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "Expected 2nd Publish call to yield data for TRIGGERING item!" );
                            AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItems[0].ClientHandle ), "Expected 2nd Publish call to yield data changes for LINKED item #0 '" + addLinkedItems[0].NodeSetting );
                            AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItems[1].ClientHandle ), "Expected 2nd Publish call to yield data changes for LINKED item #1 '" + addLinkedItems[1].NodeSetting );
                            AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItems[2].ClientHandle ), "Expected 2nd Publish call to yield data changes for LINKED item #2 '" + addLinkedItems[2].NodeSetting );
                            AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItems[3].ClientHandle ), "Expected 2nd Publish call to yield data changes for LINKED item #3 '" + addLinkedItems[3].NodeSetting );
                        }
                        else
                        {
                            addError( "Publish #2 Received the following dataChanges unexpectedly: " + PublishHelper.PrintDataChanges() );
                        }
                    }
                    addLog( "Publish 2 called and all checks complete of triggering and linked items." );
                }// write
            }
        }// setTriggering.Execute(); initial adding of 2 items
    }
    else
    {
        addError( "CreateMonitoredItems status " + uaStatus, uaStatus );
    }

    // clean-up
    deleteMonitoredItems( monitoredItems, MonitorTriggeringSubscription, g_session );
}

safelyInvoke( setTriggering594008 );