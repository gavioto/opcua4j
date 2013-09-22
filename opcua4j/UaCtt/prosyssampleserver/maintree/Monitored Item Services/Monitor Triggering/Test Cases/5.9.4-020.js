/*    Test 5.9.4 Test 20 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
        Create a triggered item (reporting). 
        Add 2 linked (triggered ) nodes: 1 x INT & 1x  Float, with the mode set to Sampling, and configured
        with a DeadbandAbsolute filter:
            For Integers: the deadbandValue will be 5.
            For Floats: the deadbandValue will be 0.5.
        Write a “reset value” to each linked node.
        Call Publish.
        In a loop: Write a new value to the triggering Node and also write the following values to the linked items, each time waiting for the RevisedPublishingInterval before calling Publish:
            Int: 0, 5, 6, 5, 10.
            Float: 0.0, 0.5, 0.6, 0.5, 1.0

      Expected Results:
        All ServiceResults = “Good”.
        All Publish results will yield a value for the Trigger node.
        The 1st Publish response will yield:
        •    Initial values for all Linked nodes.
        The 2nd Publish response will yield:
        •    Value of 0 & 0.0 for linked nodes.
        The 3rd Publish response will yield: 
        •    Value of 5 & 0.5 for linked nodes.
        The 4th Publish response will yield: 
        •    No linked items.
        The 5th Publish response will yield: 
        •    No linked items.
        The 6th Publish response will yield:
        •    Value of 10 & 1.0 for linked items.

      Revision History:
        Jul-19-2009 NP: Initial version.
        Dec-02-2010 NP: Added a missing wait before first call to Publish.
        Dec-10-2010 NP: Added Bad_MonitoredItemFilterUnsupported escape clause.
        Dec-20-2010 MI: Triggered items are not necessarily all included in the first Publish.
        Mar-09-2011 DP: Changed to call Publish until all notifications are received (instead
                        of expecting all notifications in one Publish).
*/

function setTriggering594020()
{
    // define our 3 items: 1xTrigger and 2xLinked
    // create the monitoredItems
    var triggeringSetting = NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStaticAll(), "u" );
    var linked1Setting    = NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStaticAll(), "i" );
    var linked2Setting    = NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStaticAll(), "d" );
    var triggeringItem =    MonitoredItem.fromSetting( triggeringSetting.name, 0, Attribute.Value, "", MonitoringMode.Reporting, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItems = [  MonitoredItem.fromSetting( linked1Setting.name,    1, Attribute.Value, "", MonitoringMode.Sampling,  true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both ),
                            MonitoredItem.fromSetting( linked2Setting.name,    2, Attribute.Value, "", MonitoringMode.Sampling,  true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both ) ];
    if( triggeringItem == null || addLinkedItems == null || addLinkedItems.length < 2 )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }

    if( !MonitorTriggeringSubscription.SubscriptionCreated )
    {
        addError( "Subscription for conformance unit Monitor Value Change was not created." );
        return;
    }

    // create the 2 deadbands we'll need for our linked items
    var filterInt   = Event.GetDataChangeFilter( DeadbandType.Absolute, 5,   DataChangeTrigger.StatusValue );
    var filterFloat = Event.GetDataChangeFilter( DeadbandType.Absolute, 0.5, DataChangeTrigger.StatusValue );
    addLinkedItems[0].Filter = filterInt;
    addLinkedItems[1].Filter = filterFloat;

    // read the values of all items first so that we have their current value and data-type
    ReadHelper.Execute( [ triggeringItem, addLinkedItems[0], addLinkedItems[1] ] );

    // reset all values for our deadband tests
    triggeringItem.SafelySetValueTypeKnown   ( 100, NodeIdSettings.guessType( triggeringItem.NodeSetting ) );
    addLinkedItems[0].SafelySetValueTypeKnown( 100, NodeIdSettings.guessType( addLinkedItems[0].NodeSetting ) );
    addLinkedItems[1].SafelySetValueTypeKnown( 100, NodeIdSettings.guessType( addLinkedItems[1].NodeSetting ) );
    WriteHelper.Execute( [ triggeringItem, addLinkedItems[0], addLinkedItems[1] ] );

    // CreateMonitoredItems might not succeed if the Server doesn't support DeadbandAbsolute
    var anticipatedResults = [];
    anticipatedResults[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
    anticipatedResults[1] = new ExpectedAndAcceptedResults( StatusCode.Good );
    anticipatedResults[1].addExpectedResult( StatusCode.BadMonitoredItemFilterUnsupported );
    anticipatedResults[2] = new ExpectedAndAcceptedResults( StatusCode.Good );
    anticipatedResults[2].addExpectedResult( StatusCode.BadMonitoredItemFilterUnsupported );

    // function createMonitoredItems( MonitoredItems, TimestampsToReturn, Subscription, Session, ExpectedResults, ExpectErrorNotFail )
    if( createMonitoredItems( [triggeringItem, addLinkedItems[0], addLinkedItems[1]], TimestampsToReturn.Both, MonitorTriggeringSubscription, g_session, anticipatedResults, true ) )
    {
        // just check results[1] which is the first linked item, if this failed then the other linked item would've failed too
        if( createMonItemsResp.Results[1].StatusCode.StatusCode === StatusCode.BadMonitoredItemFilterUnsupported )
        {
            addNotSupported( "DeadbandAbsolute" );
        }
        else
        {
            // set-up the triggering service call
            if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, addLinkedItems ) )
            {
                // publish #1.1
                PublishHelper.Clear();
                PublishHelper.ClearServerNotifications();

                if( AssertGreaterThan( 0, PublishHelper.ReceivedDataChanges.length, "Publish expected to receive at least one data-change for the triggering item." ) )
                {
                    // check for triggering item
                    AssertTrue( PublishHelper.HandleIsInReceivedDataChanges( triggeringItem.ClientHandle ), "Expected 1st Publish call to yield data for TRIGGERING item!" );

                    var handlesReceived = new IntegerSet;

                    // check for triggered items
                    for( i = 0;  i < addLinkedItems.length; i++ )
                    {
                        if( PublishHelper.HandleIsInReceivedDataChanges( addLinkedItems[i].ClientHandle ) )
                        {
                            addLog("Received datachange for item " + addLinkedItems[i].NodeSetting);
                            handlesReceived.insert(addLinkedItems[i].ClientHandle);
                        }
                    }

                    // write to triggering item if we didn't get values for all triggered items
                    if( handlesReceived.size() < addLinkedItems.length )
                    {
                        var monitoredItemsTemp = [];
                        monitoredItemsTemp[0] = triggeringItem;

                        // write value to triggering item
                        var newValue = (1 + monitoredItemsTemp[0].Value.Value );
                        monitoredItemsTemp[0].SafelySetValueTypeKnown( newValue, NodeIdSettings.guessType( monitoredItemsTemp[0].NodeSetting ) );

                        AssertTrue( WriteHelper.Execute( monitoredItemsTemp ), "Writes are needed in order to test the trigger." );

                        // publish #1.2
                        PublishHelper.Execute();

                        // we expect the triggering item plus all triggered items we didn't get in the last publish
                        AssertEqual( addLinkedItems.length + 1 - handlesReceived.size(), PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected " + ( addLinkedItems.length + 1 - handlesReceived.size() ) +  " values in datachange, received " + PublishHelper.CurrentDataChanges[0].MonitoredItems.length + "." )

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

                // configure the deadband values to write 
                var deadbandValuesInt   = [ 0, 6, 7, 6, 20 ];
                var deadbandValuesFloat = [ 0.0, 0.6, 0.5, 0.6, 1.5 ];
                var successes           = [ true, true, false, false, true ];
    
                // go into our actual TEST LOOP where we will:
                //  (1) write a value to the linked items
                //  (2) wait for the publish interval
                //  (3) call Publish
                //  (4) make sure we received data and that it matches the values previously written
                for( var i=0; i<deadbandValuesInt.length; i++ )
                {
                    // write deadband values to linked nodes
                    var newValue = ( 1 + Math.abs( triggeringItem.Value.Value ) );
                    triggeringItem.SafelySetValueTypeKnown( newValue, NodeIdSettings.guessType( triggeringItem.NodeSetting ) );
                    addLinkedItems[0].SafelySetValueTypeKnown( deadbandValuesInt[i],   NodeIdSettings.guessType( addLinkedItems[0].NodeSetting ) );
                    addLinkedItems[1].SafelySetValueTypeKnown( deadbandValuesFloat[i], NodeIdSettings.guessType( addLinkedItems[1].NodeSetting ) );
                    WriteHelper.Execute( [ triggeringItem, addLinkedItems[0], addLinkedItems[1] ] );
    
                    // call Publish and check that we have received what we're expecting
                    PublishHelper.Clear();
                    PublishHelper.ClearServerNotifications();
                    
                    //if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a data change for the linked item." ) )
                    if( AssertGreaterThan( 0, PublishHelper.ReceivedDataChanges.length, "Expected to receive a data change for the linked item." ) )
                    {
                        // are we expecting this to succeed?
                        if( successes[i] )
                        {
                            // check the 3 nodes are returned
                            if( AssertEqual( 3, PublishHelper.GetNumberOfReceivedMonitoredItems(), "Expected to receive 3 items in the response for Publish # " + (1+i) ) )
                            {
                                // check the handles
                                AssertTrue( PublishHelper.HandleIsInReceivedDataChanges( triggeringItem.ClientHandle ),    "Expected Publish call # " + (1+i) + " to yield data change for the triggering item: " + triggeringItem.NodeSetting );
                                AssertTrue( PublishHelper.HandleIsInReceivedDataChanges( addLinkedItems[0].ClientHandle ), "Expected Publish call # " + (1+i) + " to yield data change for the linked item: " +  addLinkedItems[0].NodeSetting );
                                AssertTrue( PublishHelper.HandleIsInReceivedDataChanges( addLinkedItems[1].ClientHandle ), "Expected Publish call # " + (1+i) + " to yield data change for the linked item: " +  addLinkedItems[1].NodeSetting );
                                // now check the values match what we wrote - (we only care about the linked items here)
                                AssertCoercedEqual( deadbandValuesInt[i],   addLinkedItems[0].Value.Value, "Expected to receive the same value previously written for linked item: " + addLinkedItems[0].NodeSetting  );
                                AssertCoercedEqual( deadbandValuesFloat[i], addLinkedItems[1].Value.Value, "Expected to receive the same value previously written for linked item: " + addLinkedItems[1].NodeSetting  );
                            }
                            else
                            {
                                addError( "Unexepectedly received the following datachanges:\n\t" + PublishHelper.PrintReceivedDataChanges( true ) );
                            }
                        }
                        else
                        {
                            // we expect the deadband to filter the value 
                            if( AssertEqual( 1, PublishHelper.ReceivedDataChanges[0].MonitoredItems.length, "Expected to receive 1 item in the response for Publish # " + (1+i) ) )
                            {
                                AssertTrue( PublishHelper.HandleIsInReceivedDataChanges( triggeringItem.ClientHandle ), "Expected Publish call # " + (1+i) + " to yield data change for the triggering item: " + triggeringItem.NodeSetting );
                            }
                        }
                    }
                }//for i...
            }// setTriggering.Execute()
        }
    }

    // clean-up
    deleteMonitoredItems( [ triggeringItem, addLinkedItems[0], addLinkedItems[1] ], MonitorTriggeringSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( setTriggering594020 );