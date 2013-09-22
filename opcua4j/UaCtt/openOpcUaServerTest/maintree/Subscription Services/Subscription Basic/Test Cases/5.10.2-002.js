/*  Test 5.10.2 Test case 2 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Modifies a subsription setting the RequestedPublishingInterval=7ms greater
        than RevisedPublishingInterval from CreateSubscription.

    Revision History
        01-Sep-2009 NP: Initial version.
        21-Oct-2009 NP: Revised to use new script library functions.
        20-Nov-2009 NP: Revised to meet new test-case requirements.
                        REVIEWED.
        15-Dec-2009 DP: Ensured the written value is always different than the previous value.
        24-Dec-2009 DP: Finds a configured node setting (instead of always using Int32).
        04-May-2010 NP: Revised, i.e. RevisedPublishingInterval will equal the requested value or greater!
*/

function modifySubscription5102002()
{
    const REVISED_OFFSET = 7;
    var subscription = new Subscription();
    if( createSubscription( subscription, g_session ) )
    {
        // register the subscription with Publish.
        publishService.RegisterSubscription( subscription );

        var defaultPublishingInterval = subscription.RevisedPublishingInterval;
        if( createMonitoredItems( defaultStaticItem, TimestampsToReturn.Both, subscription, g_session ) )
        {
            var modifySubService = new ModifySubscription( g_session );
            var newRevisedPublishingInterval = subscription.RevisedPublishingInterval + REVISED_OFFSET;
            subscription.SetParameters( newRevisedPublishingInterval, true, 30, 10, 0 , 0 );
            modifySubService.Execute( subscription );

            // flag used to continue the test, or not...
            var doPublish = true;

            // see if the revisedPublishingInterval matches the previous value (unchanged)
            print( "\tChecking revisedPublishingInterval value=" + subscription.RevisedPublishingInterval + " either (a) matches the requestedPublishingInterval=" + newRevisedPublishingInterval + " or is greater than that value." );
            if( defaultPublishingInterval === subscription.RevisedPublishingInterval )
            {
                addLog( "RevisedPublishingInterval is unchanged. This is acceptable." );
            }
            // see if the revised value matches the request
            else if( newRevisedPublishingInterval === subscription.RevisedPublishingInterval )
            {
                addLog( "RevisedPublishingInterval matches the request." );
            }
            // see if the revised value is greater than requested (expected)
            else if( newRevisedPublishingInterval < subscription.RevisedPublishingInterval )
            {
                addLog( "RevisedPublishingInterval is slower than requested. This is acceptable." );
            }
            // is the value less than requested
            else if( (defaultPublishingInterval-REVISED_OFFSET) > subscription.RevisedPublishingInterval )
            {
                addWarning( "RevisedPublishingInterval is FASTER than requested. This is not the expected behavior." );
            }
            else
            {
                // catch-all, we're not expecting anything else so report an error
                addError( "RevisedPublishingInterval is different to anything expected. RequestedPublishingInterval=" + newRevisedPublishingInterval + "; RevisedPublishingInterval=" + subscription.RevisedPublishingInterval );
                doPublish = false;
            }
            // are we happy with the server so far, in that we should try publishes?
            if( doPublish )
            {
                var startTime = UaDateTime.utcNow();
                for( var i=0; i<3; i++ )
                {
                    GenerateScalarValue( defaultStaticItem.Value.Value, NodeIdSettings.guessType( defaultStaticItem.NodeSetting ), 2 + i );
                    writeService.Execute( defaultStaticItem );
                    wait( subscription.RevisedPublishingInterval );
                    publishService.Execute( true );//no acks
                }// while
                var stopTime = UaDateTime.utcNow();
                var difference = startTime.secsTo( stopTime );
                addLog( "start: " + startTime + "; stop: " + stopTime + "; difference: " + difference );
                AssertEqual( 3, publishService.ReceivedDataChanges.length, "Expected 3 callbacks." );
            }
            // clean-up
            deleteMonitoredItems( defaultStaticItem, subscription, g_session )
        }
    }
    // unregister the subscription with Publish 
    publishService.UnregisterSubscription( subscription );
    // clean-up
    deleteSubscription( subscription, g_session );
    publishService.Clear();
}

safelyInvoke( modifySubscription5102002 );