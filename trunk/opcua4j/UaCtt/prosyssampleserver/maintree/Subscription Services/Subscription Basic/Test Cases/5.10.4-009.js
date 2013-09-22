/*  Test 5.10.4 Test 9, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Call publish and acknowledge multiple valid sequence numbers while 
        verifying that each subscription is returning the correct number 
        of dataChange callbacks.
        ServiceResult = Good.
            results[i] = Good.
            Verify sequence numbers acknowledged are not returned in availableSequenceNumbers.

    Revision History
        30-Sep-2009 NP: Initial version.
        19-Nov-2009 NP: REVIEWED.
        22-Mar-2010 NP: Added "TimeoutHint" selection to the Publish helper.
        03-May-2010 NP: Revised tolerence for callback account. Previously was not accounting
                        for a callback to be received on the start and end seconds.
        07-Sep-2010 NP: Permits the server to purge notifications of old messages and return Bad_SequenceNumberUnknown.
        20-Dec-2010 NP: Fixed the QueueSize on each item to be 1 from 10 (default). Prevents fast dynamic items sending more
                        data than expected.
        Mar-23-2011 NP: Switched to STATIC node. Now writes a value to control the dataChange(s).
*/

function publish5104009()
{
    const SCANRATETESTS = [ 1000, 2000, 4000 ];  // the scanrates to test
    const TIMEINMSECS   = 10000;                 // how much time to devote to receiving dataChange callbacks
    const WARNING_FLUCTUATION = 1;               // the +/- of callbacks we're willing to accept outside of expectations

    // step 1 - create some items to subscribe to (monitor).
    // define the monitored items and then make the call to monitor them!
    var items = MonitoredItem.fromSettings( 
        [
            NodeIdSettings.GetAScalarStaticNodeIdSetting("iud").name, 
            NodeIdSettings.GetAScalarStaticNodeIdSetting("diu").name 
        ],
        0, Attribute.Value, "", MonitoringMode.Reporting, true, undefined, 1);

    if( items == null || items.length === 0 )
    {
        addSkipped( "Static Scalar - 2 items needed" );
        return;
    }

    readService.Execute( items );

    // go into a loop, one for each scanrate to test
    for( s=0; s<SCANRATETESTS.length; s++ )
    {
        var expectedCallbackCount = Math.round( ( TIMEINMSECS / SCANRATETESTS[s] ) - 0.5 );
        addLog( "\n\n\nSCANRATE TEST: " + SCANRATETESTS[s] + " msecs. We expect " + expectedCallbackCount + " dataChange callbacks to have been received after " + ( TIMEINMSECS / 1000 ) + " seconds have elapsed." );

        // step 2 - create the subscription.
        basicSubscription = new Subscription( SCANRATETESTS[s] );
        createSubscription( basicSubscription, g_session );

        // register the subscription with Publish.
        publishService.RegisterSubscription( basicSubscription );

        // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
        if( createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription, g_session ) )
        {
            // wait 1500 msec for the server to start polling the item(s)
            wait( basicSubscription.RevisedPublishingInterval );

            var callbackCount = 0;

            // when in the future the loop shoudld exit
            var startTime = UaDateTime.utcNow();
            var stopAt = UaDateTime.utcNow();
            stopAt.addSeconds( ( TIMEINMSECS / 1000 ) );

            var expectedResults = [];
            // publish calls, get some sequenceNumber's buffered for later acknowledgement.
            while( UaDateTime.utcNow() < stopAt )
            {
                // write values to the items
                for( i=0; i<items.length; i++ )
                {
                    items[i].SafelySetValueTypeKnown( 1 + UaVariantToSimpleType(items[i].Value.Value), items[i].Value.Value.DataType );
                }//for i...
                writeService.Execute( items );
                wait( basicSubscription.RevisedPublishingInterval );
                // call publish, but do not acknowledge anything
                publishService.Execute( true );
                if( publishService.CurrentlyContainsData() )
                {
                    callbackCount++;
                    expectedResults.push( new ExpectedAndAcceptedResults( StatusCode.Good ) );
                    publishService.SetItemValuesFromDataChange( items );
                }
            }//for (calls to Publish)
            // reverse the expected results since any purged messages will be left first
            expectedResults.reverse();

            var stoppedAt = UaDateTime.utcNow();
            // lets see how many callbacks we received vs what was expected
            print( "\t** ExpectedCallbackCount: " + expectedCallbackCount + " vs received: " + callbackCount + "**" );
            if( expectedCallbackCount !== callbackCount )
            {
                addLog( "\t** Started: " + startTime + "; Ended: " + stoppedAt + "; Received: " + callbackCount + " dataChanges. **" );
                // Warnings are +/- 1 callback
                // Errors are where the difference is greater than 1
                var minRange = expectedCallbackCount - WARNING_FLUCTUATION;
                var maxRange = expectedCallbackCount + 1 + WARNING_FLUCTUATION;
                if( callbackCount >= minRange && callbackCount <= maxRange )
                {
                    addLog( "Callback count was within the acceptable range of +/- 1 callback. Received: " + callbackCount + ", but desired: " + expectedCallbackCount );
                }
                else
                {
                    addError( "Callback count was OUTSIDE the acceptable range of +/- 1 callback. Received: " + callbackCount + ", but desired: " + expectedCallbackCount );
                }
            }

            // now to acknowledge everything in one call
            print( "\tACKNOWLEDGE ALL sequenceNumbers received." );
            if( expectedResults.length > 0 && publishService.AvailableSequenceNumbers !== null )
            {
                // quickly check if we need to trim the expectedResults in case the server
                // has purged some of the notifications
                while( expectedResults.length > publishService.AvailableSequenceNumbers.length )
                {
                    print( "\t... trimming an expected result (Server purged some notifications)" );
                    expectedResults.shift();
                }
                print( "\t... there are " + expectedResults.length + " expected results now!" );
                // the OLDEST notification (sequenceNumber) may have been purged from the Server's queue
                // while we were processing... so let's allow for that in our expectations
                expectedResults[0].addExpectedResult( StatusCode.BadSequenceNumberUnknown );
                publishService.Execute( false, expectedResults, true );
            }
            else
            {
                publishService.Execute();
            }
        }//if createMonitoredItems
        else
        {
            // delete the subscription we added here 
            deleteSubscription( basicSubscription, g_session );
            // clear all stats in the publishHelper.
            publishService.Clear();
            break;
        }

        // delete the items we added in this test
        var monitoredItemsIdsToDelete = new UaUInt32s()
        var j = 0
        for(var i = 0; i< items.length; i++)
        {
            if(items[i].IsCreated)
            {
                monitoredItemsIdsToDelete[j++] = items[i].MonitoredItemId
            }
        }// for i...
        deleteMonitoredItems(monitoredItemsIdsToDelete, basicSubscription, g_session)
        // unregister the subscription with Publish 
        publishService.UnregisterSubscription( basicSubscription );
        // delete the subscription we added here 
        deleteSubscription( basicSubscription, g_session );
        // clear all stats in the publishHelper.
        publishService.Clear();
    }// for s...
}

safelyInvoke( publish5104009 );