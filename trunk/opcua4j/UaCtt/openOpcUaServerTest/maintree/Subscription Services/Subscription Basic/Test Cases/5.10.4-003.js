/*  Test 5.10.4 Test 3, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Acknowledge multiple valid sequence numbers from a valid subscription.
        ServiceResult = Good.
            results[i] = Good.
            Verify sequence numbers acknowledged are not returned in availableSequenceNumbers.

        How this test works:
            1) setup the subscription and monitored item
            2) call publish a number of times (in a loop) each time NOT validating the sequence number.
            3) each unacknowledged sequenceNumber is buffered in a variable called "receivedSequenceNumbers".
            4) after the loop is complete (see CONST PUBLISHCALLCOUNT for the loop count) all
                sequenceNumbers received are sent back and acknowledged in one call.
           The test will then clean up the monitoredItems etc.

    Revision History
        04-Sep-2009 NP: Initial version.
        19-Nov-2009 NP: Revised to meet new test-case guidelines (verification of AvailableSequenceNumbers).
                        REVIEWED.
        22-Mar-2010 NP: Added "TimeoutHint" selection to the Publish helper.
        24-Feb-2011 DP: Changed Read call from using MaxAge 10000 to MaxAge 0.
        25-Jul-2011 NP: Removed logic to expect ALL notifications to be available which is not true for Embedded devices. Logic moved 
                        to the Publish object. This test now expects the AvailableSequenceNumbers to not equal 0.
*/
   
function publish5104003()
{
    const PUBLISHCALLCOUNT = 3; //how many times to call "Publish" in a loop.

    // step 1 - adding some items to subscribe to (monitor).
    // define the monitored items and then make the call to monitor them!
    var items = MonitoredItem.fromNodeIds( NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "iud" ).id );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }

    // read the items to get their values
    readService.Execute( items, undefined, 0 );

    // step 2 - create the subscription.
    var basicSubscription = new Subscription( undefined, undefined, undefined, 10 );
    if( !createSubscription( basicSubscription, g_session ) )
    {
        return;
    }
    else
    {
        publishService.RegisterSubscription( basicSubscription );
    }

    // we will define HOW MANY notifications to expect. Later, depending upon the server we may need to use this 
    // to adjust our expectations on how many notifications to expect.
    var expectedNotifications = 0;

    // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
    if( createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription, g_session ) )
    {
        // publish calls, get some sequenceNumber's buffered for later acknowledgement.
        for( var z=0; z<PUBLISHCALLCOUNT; z++ )
        {
            // write some values to the monitoredItems
            for( var i=0; i<items.length; i++ )
            {
                items[i].SafelySetValueTypeKnown( parseInt( items[i].Value.Value ) + 1, items[i].Value.Value.DataType );
            }
            writeService.Execute( items );
            wait( basicSubscription.RevisedPublishingInterval );

            // call Publish() to get the dataChanges and do not ack any sequenceNumbers
            publishService.Execute( true );
            expectedNotifications++;
        }//for

        // check how many AvailableSequenceNumbers there are, show what's available first
        addLog( "AvailableSequenceNumbers are: " + publishService.publishResponse.AvailableSequenceNumbers.toString() );
        //AssertEqual( PUBLISHCALLCOUNT, publishService.publishResponse.AvailableSequenceNumbers.length, "All dataChange notifications (sequences) should be present since we have not acknowledged any." );
        if( AssertNotEqual( 0, publishService.UnAcknowledgedSequenceNumbers.length, "We should not have acknowledged anything yet." ) )
        {
            // wait 1 publishing cycle
            print( "*** waiting " + basicSubscription.RevisedPublishingInterval + " msecs (1 publishing cycle)" );
            wait( basicSubscription.RevisedPublishingInterval );

            publishService.Execute();
            AssertEqual( 0, publishService.publishResponse.AvailableSequenceNumbers.length, "No sequences should be available since all have been acknowledged." );
        }
        // delete the items we added in this test
        deleteMonitoredItems( items, basicSubscription, g_session );
    }
    // delete the subscription we added here 
    deleteSubscription( basicSubscription, g_session );
    publishService.UnregisterSubscription( basicSubscription );
    publishService.Clear();
}

safelyInvoke( publish5104003 );