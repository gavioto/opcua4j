/*    This routine will open 1..n sessions within a Channel, and will then create 1..n
      subscriptions per session.
      
      HOW THIS ROUTINE WORKS:
          1. Create the sessions and activate them.
          2. Create the subscriptions within each session.
          3. Add a monitoredItem to each subscription.
          4. Go into a loop where Publish() is called numerous times.
          5. Verify that all subscriptions return a dataChange.
*/
function MultiSessionMultiSubscribeTest( g_channel, SessionCount, SubscriptionCount, MonitoredItems )
{
    // check the incoming parameters first...
    if( g_channel === undefined || g_channel === null )
        throw( "MultiSessionMultiSubscribeTest() argument error: g_channel" );
    if( SessionCount === undefined || SessionCount === null || SessionCount < 1 || SessionCount > 99999 )
        throw( "MultiSessionMultiSubscribeTest() argument error: SessionCount" );
    if( SubscriptionCount === undefined || SubscriptionCount === null || SubscriptionCount < 1 || SubscriptionCount > 99999 )
        throw( "MultiSessionMultiSubscribeTest() argument error: SubscriptionCount" );
    if( MonitoredItems === undefined || MonitoredItems === null )
        throw( "MultiSessionMultiSubscribeTest() argument error: MonitoredItems" );
    if( MonitoredItems.MonitoredItemId !== undefined )
        MonitoredItems = [MonitoredItems]; // turn the single monitoredItem into an Array
    if( MonitoredItems.length < 1 )
        throw( "MultiSessionMultiSubscribeTest() argument error: MonitoredItems length < 1" );

    var items = [];                // stores the monitoredItems for each subscription
    var sessions = [];             // stores the session objects
    var publishService = [];       // stores the publish objects
    var i;

    // STEP ONE - CREATE THE SESSIONS
    addLog( "Creating '" + SessionCount + "' Sessions, each with '" + SubscriptionCount + "' subscriptions." );
    for( var s=0; s<SessionCount; s++ )
    {
        // define and instantiate the session/connection
        sessions[s] = new UaSession( g_channel );
        if( !connectSession( g_channel, sessions[s] ) )
        {
            addError( "Session #" + s + " Not connected." );
            return;
        }
        // create a publish service object for this session
        publishService[s] = new Publish( sessions[s] );
    }

    // STEP TWO - CREATE THE SUBSCRIPTIONS FOR EACH SESSION
    // STEP THREE ALSO - ADD THE MONITORED ITEM
    var subscriptionObject = [];
    for( s=0; s<SessionCount; s++ ) // 's' for Session
    {
        //inner loop = Subscriptions for a session
        for( i=0; i<SubscriptionCount; i++ )
        {
            //create the subscription object and set the priority to 500
            subscriptionObject[( s * SessionCount ) + i] = new Subscription();
            if( createSubscription( subscriptionObject[( s * SessionCount ) + i], sessions[s] ) )
            {
                items[ ( s * SessionCount ) + i ] = MonitoredItem.Clone( MonitoredItems );
                createMonitoredItems( items[ ( s * SessionCount ) + i ], TimestampsToReturn.Both, subscriptionObject[( s * SessionCount ) + i], sessions[s] );
            }
        }// for i...
    }// for s...

    // wait for just one publish cycle
    addLog( "Waiting " + subscriptionObject[0].RevisedPublishingInterval + " msec before invoking first Publish call." );
    wait( subscriptionObject[0].RevisedPublishingInterval );

    // STEP FOUR - CALL PUBLISH() AND VERIFY ALL SUBSCRIPTIONS CHECK-IN, FOR ALL SESSIONS
    print( "\n\n\t\tSESSION COUNT TO LOOP THROUGH IS: " + SessionCount );
    for( s=0; s<SessionCount; s++ )
    {
        print( "\n\n\t\tSUBSCRIPTION COUNT TO LOOP THROUGH IS: " + SubscriptionCount + "; (session # " + (1+s) + " of " + SessionCount + ")" );
        for( i=0; i<SubscriptionCount; i++ )
        {
            print( "Waiting the revised sampling interval of '" + items[0].RevisedSamplingInterval + " ms' before calling publish..." );
            wait( items[0].RevisedSamplingInterval );
            if( publishService[s].Execute() )
            {
                // find the subscription object that applies to this dataChange and then increment
                // the dataChangeCallbackCount.
                for( var x=0; x<SubscriptionCount; x++ )
                {
                    if( subscriptionObject[( s * SessionCount ) + x].SubscriptionId == publishService[s].SubscriptionIds[0] )
                    {
                        subscriptionObject[( s * SessionCount ) + x].DataChangeNotificationCount++;
                        break;
                    }
                }
            }
        }//for (inner)
    
    }//for (outer)

    // CLEAN-UP, while generating some stats
    var expectedCallbackCount = SessionCount * SubscriptionCount;
    var totalCallbackCount = 0;
    for( s=0; s<SessionCount; s++ ) // 's' for Session
    {
        for( var i=0; i<SubscriptionCount; i++ )
        {
            deleteMonitoredItems( items[ ( s * SessionCount ) + i ], subscriptionObject[( s * SessionCount ) + i], sessions[s] );
            deleteSubscription( subscriptionObject[( s * SessionCount ) + i], sessions[s] );
            publishService[s].Clear();
            totalCallbackCount += subscriptionObject[( s * SessionCount ) + i].DataChangeNotificationCount;
        }
        disconnectSession( g_channel, sessions[s] );
    }//for (inner)

    // Verdict? did all subscriptions yield a callback? the same # of callbacks for each subscription?
    AssertGreaterThan( expectedCallbackCount - 1, totalCallbackCount, "Expected each subscription to make a callback." );
    for( s=0; s<SessionCount; s++ ) // 's' for Session
    {
        for( var i=0; i<SubscriptionCount; i++ )
        {
            AssertNotEqual( 0, subscriptionObject[( s * SessionCount ) + i].DataChangeNotificationCount, "Expected a callback from Subscription Id: " + subscriptionObject[( s * SessionCount ) + i].SubscriptionId );
        }
    }
}