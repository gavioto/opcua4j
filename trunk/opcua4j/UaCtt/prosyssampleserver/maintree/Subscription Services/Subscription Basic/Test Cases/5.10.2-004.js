/*  Test 5.10.2 Test case 4 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Modifies a subsription setting RequestedPublishingInterval
        matches RevisedPublishingInterval from CreateSubscription.
        
    Revision History
        01-Sep-2009 NP: Initial version.
        21-Oct-2009 NP: Revised to use new script library functions.
        20-Nov-2009 NP: Revised to meet the new test-case criteria.
                        REVIEWED.
        15-Dec-2009 DP: Ensured the written value is always different than the previous value.
        24-Dec-2009 DP: Finds a configured node setting (instead of always using Int32).
*/

function modifySubscription5102004()
{
    var subscription = new Subscription();
    if( createSubscription( subscription, g_session ) )
    {
        // register the subscription with Publish.
        publishService.RegisterSubscription( subscription );

        var originalSubscription = subscription.Clone();
        if( createMonitoredItems( defaultStaticItem, TimestampsToReturn.Both, subscription, g_session ) )
        {
            var modifySubService = new ModifySubscription( g_session );
            modifySubService.Execute( subscription );

            // check the revisedValues are the same as they were previously
            AssertEqual( originalSubscription.RevisedPublishingInterval, subscription.RevisedPublishingInterval, "RevisedPublishingInterval difference." );
            AssertEqual( originalSubscription.RevisedLifetimeCount, subscription.RevisedLifetimeCount, "RevisedLifetimeCount difference." );
            AssertEqual( originalSubscription.RevisedMaxKeepAliveCount, subscription.RevisedMaxKeepAliveCount, "RevisedMaxKeepAliveCount difference." );

            var startTime = UaDateTime.utcNow();
            for( var i=0; i<3; i++ )
            {
                GenerateScalarValue( defaultStaticItem.Value.Value, defaultStaticItem.DataType, 4 + i );
                writeService.Execute( defaultStaticItem );
                wait( subscription.RevisedPublishingInterval );
                publishService.Execute( true );//no acks
            }// while
            var stopTime = UaDateTime.utcNow();
            var difference = startTime.secsTo( stopTime );
            addLog( "start: " + startTime + "; stop: " + stopTime + "; difference: " + difference );

            AssertEqual( 3, publishService.ReceivedDataChanges.length, "Expected 3 callbacks." );
            //delete the monitoredItem
            deleteMonitoredItems( defaultStaticItem, subscription, g_session );
        }
    }
    // unregister the subscription with Publish 
    publishService.UnregisterSubscription( subscription );
    // clean-up
    deleteSubscription( subscription, g_session );
    publishService.Clear();
}

safelyInvoke( modifySubscription5102004 );