/*  Test 5.10.4 Test 4, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Acknowledge multiple valid sequence numbers from multiple valid subscriptions.
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
        19-Nov-2009 NP: Revised to meet the new requirements of the test-case.
                        REVIEWED.
        22-Mar-2010 NP: Added "TimeoutHint" selection to the Publish helper.
        25-Jul-2011 NP: Removed logic to expect ALL notifications to be available which is not true for Embedded devices. Logic moved 
                        to the Publish object. This test now expects the AvailableSequenceNumbers to not equal 0.
*/

function publish5104004()
{
    const SUBSCRIPTIONCOUNT = 2;
    const PUBLISHCALLCOUNT = 3; //how many times to call "Publish" in a loop.

    var subscriptions = [ new Subscription( undefined, undefined, undefined, 10 ), new Subscription( undefined, undefined, undefined, 10 ) ];
    var items = [];

    // step 1 - create the subscriptions and monitored items
    for( sc=0; sc<subscriptions.length; sc++ )
    {
        // define the monitored items and then make the call to monitor them!
        items[sc] = MonitoredItem.fromSettings( ["/Server Test/NodeIds/Static/All Profiles/Scalar/Int16", "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32" ] );
        if( items[sc] === undefined || items[sc] === null || items[sc].length !== 2 )
        {
            addSkipped( "Unable to execute this test because Int16 and Int32 are not configured in the Static settings. Please check the configuration." );
            if( items.length === 1 )
            {
                if( NodeIdSettings.guessType( items[sc][0].NodeSetting ) === BuiltInType.Int32 )
                {
                    _dataTypeUnavailable.store( "Int32" );
                }
                else
                {
                    _dataTypeUnavailable.store( "Int16" );
                }
            }
            return;
        }

        if( !createSubscription( subscriptions[sc], g_session ) )
        {
            return;
        }
        // step 2 - adding some items to subscribe to (monitor).
        // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
        if( !createMonitoredItems( items[sc], TimestampsToReturn.Both, subscriptions[sc], g_session ) )
        {
            for( var z=0; z<sc; z++ )
            {
                // unregister the subscription with Publish 
                publishService.UnregisterSubscription( subscriptions );
                deleteSubscription( subscriptions[z], g_session );
            }
            return;
        }
    }

    publishService.ClearServerNotifications();
    publishService.Clear();
    publishService.RegisterSubscription( subscriptions );

    // step #2 - publish calls, get some sequenceNumber's buffered for later acknowledgement.
    for( var z=0; z<PUBLISHCALLCOUNT; z++ )
    {
        // write some values to all items
        items[0][0].Value.Value.setInt16( new Date().getMilliseconds() );
        items[0][1].Value.Value.setInt32( new Date().getMilliseconds() );
        writeService.Execute( items[0] );
        wait( subscriptions[0].RevisedPublishingInterval );

        // call Publish() twice - 1 per subscription
        publishService.Execute( true );
        publishService.Execute( true );

        // wait 1 publishing cycle
        print( "*** waiting " + subscriptions[0].RevisedPublishingInterval + " msecs (1 publishing cycle)" );
        wait( subscriptions[0].RevisedPublishingInterval );
    }//for

    // make sure we have a collection of unack'd sequences
    //AssertEqual( PUBLISHCALLCOUNT, publishService.publishResponse.AvailableSequenceNumbers.length, "All dataChange notifications (sequences) should be present since we have not acknowledged any." );
    AssertNotEqual( 0, publishService.UnAcknowledgedSequenceNumbers.length, "We should not have ack'd anything!" );

    // now to acknowledge everything in one call
    // rebuild our request, and specify the sequence number and subscriptionId
    print( "\n\n\n~~~~~~~~~~~~~~~ Last Publish call ~~~~~~~~~~~~~~~~~~~~~~~\n" );
    if( publishService.Execute() )
    {
        // AvailableSequenceNumbers should be empty now!
        AssertEqual( 0, publishService.publishResponse.AvailableSequenceNumbers.length, "No sequences should be available since all have been acknowledged." );

        // call Publish again, we should receive just a keep-alive
        publishService.Execute();
        AssertFalse( publishService.CurrentlyContainsData(), "No dataChanges expected (keep-alive only)." );
    }

    // clean-up
    for( sc=0; sc<SUBSCRIPTIONCOUNT; sc++ )
    {
        //Now Delete the MonitoredItems
        deleteMonitoredItems( items[sc], subscriptions[sc], g_session );
        // delete the subscription we added here 
        deleteSubscription( subscriptions[sc], g_session );
    }
    publishService.UnregisterSubscription( subscriptions );
    publishService.Clear();
}

safelyInvoke( publish5104004 );