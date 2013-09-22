/*  Test 5.10.1 Test 17, prepared by Development; compliance@opcfoundation.org
    Description:
          Create two subscriptions with their priorities being equal.
          The test will be performed 3 times to vary the priority as:
              100, 200, 0

    Revision History
        20-Oct-2009 DEV: Initial version.
        20-Nov-2009  NP: Revised to meet the new test-case requirements.
                         REVIEWED.
        08-Feb-2011  DP: Changed subscription MaxKeepAliveCount to ensure
                         the server creates a large enough retransmission
                         queue to hold the generated notifications.
         Mar-23-2011 NP: Switched to STATIC node. Now writes a value to control the dataChange(s).
*/

function createSubscription5101017()
{
    var summaryInformation = []; // will store text to say "priority x subscription callback count received X, expected to be in range of Y and Z." etc.
    var priorities = [ 100, 200, 0 ];
    var subscriptions = [ new Subscription(), new Subscription() ];
    var subscriptionItems  = [];
    var publishCallCount = ( subscriptions.length * 5 );
    var i;
    for( i=0; i<subscriptions.length; i++ )
    {
        subscriptionItems[i] = MonitoredItem.Clone( defaultStaticItem );
    }
    // get the initial values for all items
    readService.Execute( subscriptionItems );

    for( var p=0; p<priorities.length; p++ )
    {
        var s;
        //create the subscription object and set the priority
        for( s=0; s<subscriptions.length; s++ )
        {
            subscriptions[s].MaxKeepAliveCount = publishCallCount;
            subscriptions[s].Priority = priorities[p];
            if( !createSubscription( subscriptions[s], g_session ) )
            {
                return;
            }// if createSubscription
            if( !createMonitoredItems( subscriptionItems[s], TimestampsToReturn.Both, subscriptions[s], g_session ) )
            {
                deleteSubscription( subscriptions[s], g_session );
                return;
            }
        }

        // register subscriptions with Publish 
        publishService.RegisterSubscription( subscriptions );

        // Publish a number of times, to build a list of callbacks
        for( s=0; s<publishCallCount; s++ )
        {
            // write a value to ALL items
            for( i=0; i<subscriptions.length; i++ )
            {
               subscriptionItems[i].SafelySetValueTypeKnown( 1 + UaVariantToSimpleType(subscriptionItems[i].Value.Value), subscriptionItems[i].Value.Value.DataType ); 
            }
            writeService.Execute( subscriptionItems, undefined, undefined, undefined, DO_NOT_VERIFY_WRITE );

            // wait the applicable time before issuing publish call(s)
            wait( subscriptions[0].RevisedPublishingInterval );
            // call Publish twice, once per subscription!
            publishService.Execute( true ); //do not acknowledge anything! this is being called for subscription 1 of 2
            publishService.Execute( true ); //do not acknowledge anything! this is being called for subscription 2 of 2
        }// for s...
        // now cycle through the received subscriptionIds to compare the counts
        for( var r=0; r<publishService.SubscriptionIds.length; r++ )
        {
            for( var s=0; s<subscriptions.length; s++ )
            {
                if( subscriptions[s].SubscriptionId == publishService.SubscriptionIds[r] )
                {
                    subscriptions[s].DataChangeNotificationCount++;
                    break;
                }
            }// for s...
        }// for r...
        summaryInformation.push( "Priority " + priorities[p] + ":\n\tSubscription 1 callback count: " + subscriptions[0].DataChangeNotificationCount + "\n\tSubscription 2 callback count: " + subscriptions[1].DataChangeNotificationCount + "\n" );
        addLog( "Callback counts: Subscription1=" + subscriptions[0].DataChangeNotificationCount + "; Subscription2=" + subscriptions[1].DataChangeNotificationCount );
        AssertEqual( subscriptions[0].DataChangeNotificationCount, subscriptions[1].DataChangeNotificationCount, "Expected the same number of dataChanges for both subscriptions. Priority tested: " + priorities[p] );

        //clean-up
        for( var i=0; i<subscriptions.length; i++ )
        {
            deleteMonitoredItems( subscriptionItems[i], subscriptions[i], g_session );
            deleteSubscription( subscriptions[i], g_session );
        }

        // unregister subscriptions with Publish 
        publishService.UnregisterSubscription( subscriptions );

    }//for p...

    publishService.Clear();
    addLog( summaryInformation.toString() );
}

safelyInvoke( createSubscription5101017 );