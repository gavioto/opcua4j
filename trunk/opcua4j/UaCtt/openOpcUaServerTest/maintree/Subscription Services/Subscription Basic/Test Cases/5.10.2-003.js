/*  Test 5.10.2 Test case 3 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Modifies a subsription setting the RequestedPublishingInterval=7ms less
        than RevisedPublishingInterval from CreateSubscription.
    Revision History
        01-Sep-2009 NP: Initial version
        21-Oct-2009 NP: Revised to use new script library functions.
        15-Dec-2009 DP: Ensured the written value is always different than the previous value.
        24-Dec-2009 DP: Finds a configured node setting (instead of always using Int32).
*/

function modifySubscription5102003()
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
            subscription.SetParameters( subscription.RevisedPublishingInterval - REVISED_OFFSET, true, 30, 10, 0 , 0 );
            modifySubService.Execute( subscription );

            // check the revisedPublishingInterval is +/- the OFFSET
            print( "\tChecking revisedPublishingInterval value=" + subscription.RevisedPublishingInterval + " is in the range of " + (defaultPublishingInterval - REVISED_OFFSET) + " and " + (defaultPublishingInterval + REVISED_OFFSET) );
            AssertInRange( defaultPublishingInterval - REVISED_OFFSET, defaultPublishingInterval + REVISED_OFFSET, subscription.RevisedPublishingInterval, "Expected the revisedPublishingInterval to be the previous value of: " + defaultPublishingInterval + " +/- the offset: " + REVISED_OFFSET );

            var startTime = UaDateTime.utcNow();
            for( var i=0; i<3; i++ )
            {
                GenerateScalarValue( defaultStaticItem.Value.Value, defaultStaticItem.DataType, 3 + i );
                writeService.Execute( defaultStaticItem );
                wait( subscription.RevisedPublishingInterval );
                publishService.Execute( true );//no acks
            }// for i
            var stopTime = UaDateTime.utcNow();
            var difference = startTime.secsTo( stopTime );
            addLog( "start: " + startTime + "; stop: " + stopTime + "; difference: " + difference );

            AssertEqual( 3, publishService.ReceivedDataChanges.length, "Expected 3 callbacks." );
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

safelyInvoke( modifySubscription5102003 );