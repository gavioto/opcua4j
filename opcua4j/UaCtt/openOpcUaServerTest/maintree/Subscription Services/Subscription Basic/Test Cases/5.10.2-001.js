/*  Test 5.10.2 Test case 1 prepared by Development, compliance@opcfoundation.org
    Description:
        Modifies a subsription using the default parameter values.

    Revision History
        24-Aug-2009 DEV: Initial version
        21-Oct-2009 NP : Revised script to use new script library class objects.
        20-Nov-2009 NP : Revised to meet new test-case criteria.
                         REVIEWED.
        24-Dec-2009 DP: Finds a configured node setting (instead of always using Int32).
        26-Mar-2010 NP: Fixed the Write to use a different value, fixed the callback count.
        22-Feb-2011 DP: Added a timing check, as per the test case. (And removed the wait
                        between calling Write and Publish.)
                        Changed the initial Publish call to Publish until a keep-alive is
                        returned, and then reset the counters so that the expected number
                        of notifications is valid.
*/

function modifySubscription5102001()
{
    const NUMWRITES = 3;
    var subscription = new Subscription();
    var i;
    
    if( createSubscription( subscription, g_session ) )
    {
        // register the subscription with Publish.
        publishService.RegisterSubscription( subscription );

        if( createMonitoredItems( defaultStaticItem, TimestampsToReturn.Both, subscription, g_session ) )
        {
            // call Publish, as we want to consume the initial data values 
            publishService.ClearServerNotifications();
            publishService.Clear();

            // modify subscription
            var modifySubService = new ModifySubscription( g_session );
            subscription.SetParameters( 2000, true, 30, 10, 0, 0 );
            modifySubService.Execute( subscription );

            // now to use the Publishing() service to check that the
            // publishing interval has changed            
            var startTime = UaDateTime.utcNow();
            for( i=0; i<NUMWRITES; i++ )
            {
                GenerateScalarValue( defaultStaticItem.Value.Value, NodeIdSettings.guessType( defaultStaticItem.NodeSetting ), i );
                writeService.Execute( defaultStaticItem );
                wait( defaultStaticItem.RevisedSamplingInterval );
                publishService.Execute( true );//no acks
            }// while
            var stopTime = UaDateTime.utcNow();
            var mdifference = startTime.msecsTo( stopTime );
            addLog( "start: " + startTime + "; stop: " + stopTime + "; difference: " + mdifference + " milliseconds." );
            AssertInRange( 5700, 7300, mdifference, "Expected a PublishingInterval of 2000 but actual interval was " + ( mdifference / NUMWRITES ) );
            AssertEqual( NUMWRITES, publishService.ReceivedDataChanges.length, "Expected " + ( 1 + NUMWRITES ) + " callbacks." );
        }
        deleteMonitoredItems( defaultStaticItem, subscription, g_session );
    }
    // unregister the subscription with Publish 
    publishService.UnregisterSubscription( subscription );
    deleteSubscription( subscription, g_session );
    publishService.Clear();
}

safelyInvoke( modifySubscription5102001 );