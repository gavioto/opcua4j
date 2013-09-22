/*    This function is based on work from Anand Taparia.

      This function will define a monitoredItem and will set the initial queueSize and 
      set the policy for discarding oldest queued items.
      The function then proceeds to write values to the node.
      Upon completing the writes (to fill the queue) a call to Publish() is made where the 
      results are compared to what is expected.

      Parameters:
        queueSize:            Numeric. The size of the queue for the monitored item
        discardOldest         Boolean. True=discard oldest.
        nodeIdSettingName:    String.  The setting name of the node to use for monitoredItem
        writeValues:          Array.   The values to write. Each write value is done in one transaction.
                                       These are either UaVariants or JavaScript numbers that will fit in Int32.
        monitoredItemFilter:  Filter.  A MonitoredItem filter, i.e. Deadband.
*/
function createMonitoredItemsTestQueueSize( queueSize, discardOldest, nodeIdSettingName, writeValues, session, subscription, monitoredItemFilter, requestedTimestamps )
{
    if( arguments.length < 6 )
    {
        addError( "createMonitoredItemsTestQueueSize(): expected " + createMonitoredItemsTestQueueSize.length + " arguments" );
        return;
    }

    if( requestedTimestamps === null || requestedTimestamps === undefined )
    {
        requestedTimestamps = TimestampsToReturn.Both;
    }
    
    const ITEM_HANDLE = 0x0;

    var publishService = new Publish( session, subscription.TimeoutHint );
    publishService.RegisterSubscription( subscription );
    var writeService = new Write( session );

    if( !subscription.SubscriptionCreated )
    {
        addError( "Subscription for conformance unit Monitor QueueSize_1 was not created." );
    }
    else
    {
        // Create a monitored item of the node to write to and get dataChange notifications of
        var monitoredItemDefault = MonitoredItem.fromSetting( nodeIdSettingName, 0 );
        monitoredItemDefault.SamplingInterval = 0;
        monitoredItemDefault.QueueSize = queueSize;
        monitoredItemDefault.DiscardOldest = discardOldest;

        var monitoredItems = [ monitoredItemDefault ];
        if( createMonitoredItems( monitoredItems, requestedTimestamps, subscription, session ) )
        {
            // call Publish to clear anything in the Server's queue
            publishService.ClearServerNotifications();
            publishService.Clear();

            if( monitoredItems[0].QueueSize !== queueSize && monitoredItems[0].QueueSize !== 0 )
            {
                addLog( "The server revised the QueueSize to " + monitoredItems[0].QueueSize );
            }

            // Now perform NUMBER_WRITES unique writes
            print( "STEP 2: Writing " + writeValues.length + " unique values to the item." );

            var x;
            for ( x=0; x<writeValues.length; x++)
            {
                // for backward compatibility, allow writeValues to contain JavaScript numbers instead of UaVariants
                if( writeValues[x].DataType === undefined )
                {
                    // set the value to write, make it type safe
                    monitoredItems[0].SafelySetValueTypeKnown( writeValues[x], NodeIdSettings.guessType( monitoredItems[0].NodeSetting ) );
                }
                else
                {
                    monitoredItems[0].Value.Value = writeValues[x];
                }
                if( writeService.Execute( [ monitoredItems[0] ] ) === false )
                {
                    break;
                }

                // short delay after write
                wait( subscription.RevisedPublishingInterval );
            }// for x...

            print( "STEP 3 - Call Publish and check our received value." );
            var tries = 0;
            do
            {
                // Add a delay after the write, just to allow time for the write to physically take place
                print( "Waiting " + subscription.RevisedPublishingInterval + "ms before publish to allowing write to commit within the Server (just in case Server responds too soon)." );
                wait( subscription.RevisedPublishingInterval );
                ++tries;
            } while(  publishService.Execute() && publishService.CurrentlyContainsData() && tries < writeValues.length );
            if( publishService.ReceivedDataChanges.length >= 1 )
            {
                // Make sure that we have the number of items as specified to buffer (queueSize).
                // The first data change received should be the same size as the queue size. In
                // the case where a server is somewhat slow, multiple data changes may be 
                // recieved; the last data change may be smaller than the queue size, but all
                // prior data changes should be the same size as queue size.
                AssertEqual( queueSize, publishService.ReceivedDataChanges[0].MonitoredItems.length, "Checking the number of items first received matches the queue size" );
                for( x = 1; x < publishService.ReceivedDataChanges.length - 1; x++ )
                {
                    AssertEqual( queueSize, publishService.ReceivedDataChanges[x].MonitoredItems.length, "Checking the number of items received in data change " + x + " matches the queue size" );
                }
                if( publishService.ReceivedDataChanges.length > 1 )
                {
                    AssertInRange( 1, queueSize, publishService.ReceivedDataChanges[publishService.ReceivedDataChanges.length-1].MonitoredItems.length, "Checking the number of items last received does not exceed the queue size" );
                }
                
                // check the handle is correct
                for( x = 0; x < publishService.ReceivedDataChanges.length; x++ )
                {
                    AssertEqual( ITEM_HANDLE, publishService.ReceivedDataChanges[x].MonitoredItems[0].ClientHandle, "Checking the ClientHandle of the item received matches what we expected." );
                }
                
                var valueWritten;
                var valueReceived;
                var d;
                
                // check if the event is first/LAST depending on DiscardOldest
                if( discardOldest )
                {
                    print( "DiscardOldest is set... now to check the values received..." );
                    // Verify that the values we have received match up with what we wrote
                    // and also as dictated by the 'QueueSize' and 'DiscardOldest' settings.
                    var valueIndex = writeValues.length - 1;
                    for( d = publishService.ReceivedDataChanges.length - 1; d >= 0; d-- )
                    {
                        queueSize = publishService.ReceivedDataChanges[d].MonitoredItems.length;
                        for ( x=queueSize-1; x>=0; x--, valueIndex-- ) 
                        {
                            valueWritten  = writeValues[valueIndex];
                            valueReceived = publishService.ReceivedDataChanges[d].MonitoredItems[x].Value.Value;
                            print( "\tValue Written: " + valueWritten + "; Value Received: " + valueReceived );
                            AssertCoercedEqual( valueWritten, valueReceived, "The value received is not the value we expected when we wrote the values!" );
                        }
                    }                
                }
                else
                {
                    print( "DiscardOldest is NOT set... now to check the values AND for our event..." );
                    // Verify that the values we have received match up with what we wrote
                    // and also as dictated by the 'QueueSize' and 'DiscardOldest' settings.
                    if( publishService.ReceivedDataChanges[0].MonitoredItems.length >= queueSize )
                    {
                        for ( x=0; x<queueSize; x++ ) 
                        {
                            valueWritten  = writeValues[x];
                            valueReceived = publishService.ReceivedDataChanges[0].MonitoredItems[x].Value.Value;
                            print( "\tValue Written: " + valueWritten + "; Value Received: " + valueReceived );
                            AssertCoercedEqual( valueWritten, valueReceived, "The value received in the Publish() call does not match the value previously written!" );
                        }
                    }
                    else
                    {
                        addError( "queueSize is '" + queueSize + "' but the dataChanges received are only '" + publishService.ReceivedDataChanges[0].MonitoredItems.length + "'" );
                    }
                }
                    
                // check if the timestamps requested were received AS requested!
                print( "\n\nTimestamps requested: " + TimestampsToReturn.toString( requestedTimestamps ) );
                for( d=0; d<publishService.ReceivedDataChanges.length; d++ )
                {
                    print( "DataChange # " + (1+d) );
                    publishService.ValidateTimestampsInDataChange( publishService.ReceivedDataChanges[d], requestedTimestamps );
                }
            }
            else
            {
                addError( "NO DATA RECEIVED! We expected dataChanges!" );
            }

            // Cleanup
            // Delete the items we added in this test
            deleteMonitoredItems( monitoredItems, subscription, g_session );
            publishService.Clear();
        }// if createMonItems
    }//if subCreated

    //clean-up
    writeService = null;
    publishService = null
}