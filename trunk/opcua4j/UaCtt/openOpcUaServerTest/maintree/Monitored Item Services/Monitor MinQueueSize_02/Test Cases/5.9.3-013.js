/*  Test 5.9.3 Test 13 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
       Create 1 active subscription monitoring a static node whose queueSize = 2.
       Write 2 values to the node. Call Publish. Write 2 more values to the node.
       Change the monitoring mode to Disabled. Call Publish. Change the monitoring
       mode to Reporting. Call Publish.
    Expected Results:
        All service and operation level results are “Good”.
        The 1st Publish yields the 2 data changes, whose values match those written.
        The 2nd publish call yields no data (because the queue in the server should be cleared).
        The 3rd publish call yields the data previously written.

    NOTE:
        Although the Subscription is DISABLED, we do not expect the monitoredItems queue 
        to be cleared which is why the last Publish call expects to receive both values 
        previously written.
        If we modified the mode of each MonitoredItem to DISABLED then we would expect 
        the queue for item to be cleared.

    Revision History:
        16-Dec-2009 NP: Initial Version.
        07-Sep-2010 NP: Script now checks revisedQueueSize. Moved from "Monitor Value Change" cu.
        26-Feb-2011 DP: Fixed cases where AssertTrue() was used instead of AssertEqual().
                        Changed to write two unique values while monitoring mode is disabled.
        07-Mar-2011 MI: The queue has to be deleted when setting the monitoring mode to disabled
*/

function setMonitoredItems593013()
{
    if( !MonitorQueueSize2Subscription.SubscriptionCreated )
    {
        addError( "Test aborted. Subscription for 'Monitor Value Change' was not created." );
        return;
    }

    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( nodeSetting === undefined || nodeSetting === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    
    var item = MonitoredItem.fromNodeIds( nodeSetting.id )[0];
    if( item === null )
    {
        addWarning( "Test cannot be completed: no static array NodeIds were found in settings" );
        return;
    }
    const NUM_WRITES = 2;

    // setup the item per the test-case requirements
    item.QueueSize = 2;

    // create the monitoredItem
    if( createMonitoredItems( item, TimestampsToReturn.Both, MonitorQueueSize2Subscription, g_session ) )
    {
        // check the revisedQueueSize
        if( item.QueueSize < 2 )
        {
            addWarning( "Unable to complete test because the Server did not accept the QueueSize of 2, but revised the QueueSize to: " + item.RevisedQueueSize );
        }
        else
        {
            // generate the values to write
            var i = 0;
            var writeValues = [];
            for( i=0; i<NUM_WRITES; i++ )
            {
                writeValues[i] = new Date().getSeconds() + i;
            }

            // Clear the server's notification queue
            PublishHelper.ClearServerNotifications();

            // TEST 1: WRITE 2 VALUES, CALL PUBLISH
            // now to write 2 values to the item, we'll use the system clock to do this
            for( i=0; i<NUM_WRITES; i++ )
            {
                item.SafelySetValueTypeUnknown( writeValues[i], g_session );
                if( AssertTrue( WriteHelper.Execute( item ), "Expected the write to succeed." ) )
                {
                    wait( item.RevisedSamplingInterval );
                }
            }// for i...

            wait( MonitorQueueSize2Subscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            // Publish #1, 2 dataChanges expected. Values match those just written
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected the Publish to yield dataChanges." ) )
            {
                AssertEqual( 1, PublishHelper.CurrentDataChanges.length, "Expected to receive one dataChangeNotification." );
                AssertEqual( NUM_WRITES, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive one value change per write, a total of " + NUM_WRITES + " values." );
                for( i=0; i<NUM_WRITES; i++ )
                {
                    AssertCoercedEqual( writeValues[i], PublishHelper.CurrentDataChanges[0].MonitoredItems[i].Value.Value, "Expected to receive the same value written." );
                }

                // TEST 2: WRITE 2 MORE VALUES, CHANGE MONITORING MODE, CALL PUBLISH
                for( i=0; i<NUM_WRITES; i++ )
                {
                    writeValues[i] += NUM_WRITES;
                    item.SafelySetValueTypeUnknown( writeValues[i], g_session );
                    if( AssertTrue( WriteHelper.Execute( item ), "Expected the write to succeed." ) )
                    {
                        wait( MonitorQueueSize2Subscription.RevisedPublishingInterval );
                    }
                }// for i...
                // now change the monitoringMode to Disabled
                if( !SetMonitoringModeHelper.Execute( MonitoringMode.Disabled, item, MonitorQueueSize2Subscription ) )
                {
                    addError( "Test aborted. SetMonitoringMode failed. Cannot test if the queue was cleared in the server." );
                }
                else
                {
                    // call Publish, we should get no dataChanges
                    AssertTrue( PublishHelper.Execute() && ( PublishHelper.CurrentlyContainsData() == false ), "Expected Publish to succeed, but with zero dataChanges because the monitoringMode was set to Disabled." );
                    
                    // change the monitoringMode back to Reporting, call Publish again
                    if( !SetMonitoringModeHelper.Execute( MonitoringMode.Reporting, item, MonitorQueueSize2Subscription ) )
                    {
                        addError( "Test aborted. SetMonitoringMode failed. Cannot test if the queue was cleared in the server." );
                    }
                    else
                    {
                        // call Publish, we should still have received a single callback yielding value last written.
                        if( AssertTrue( PublishHelper.Execute() && ( PublishHelper.CurrentlyContainsData() ), "Expected Publish to succeed and a single dataChange notification because the monitoringMode was set to Disabled and then Reporting, which should always result in the server sending an \"initial\" data change." ) )
                        {
                            // the queue was emptied when setting the monitoring mode to disabled - so just expect 1 value
                            if(AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected " + item.QueueSize + " items in dataChange notification messsage." ))
                            {
                                // make sure the the value received matchs the previously written value
                                AssertCoercedEqual( writeValues[1], PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value, "Expected to receive the same value as the one previously written." );
                            }
                        }
                    }
                }
            }
        }
    }
    // CLEAN UP
    deleteMonitoredItems( item, MonitorQueueSize2Subscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( setMonitoredItems593013 );