/*  Test 5.10.1 Test 24, prepared by Dale Pope; dale.pope@matrikon.com
    Description:
          Given a valid subscription
            And an amount of time approaching the subscription's expiry time passes
          When a service requiring the SubscriptionId is called
          Then the service succeeds.

    Revision History
        2009-10-20 DP: Initial version.
        2009-11-20 NP: REVIEWED.
*/

function createSubscription5101024( publishingInterval, lifetimeCount )
{
    const GIVETIME = 100; // amount of time to allow for lag 

    var subscription = new Subscription( publishingInterval, true, lifetimeCount, Math.floor( lifetimeCount / 3 ) );
    if( createSubscription( subscription, g_session ) )
    {
        var lifetime; // the lifetime in milliseconds
        lifetime = subscription.RevisedPublishingInterval * subscription.RevisedLifetimeCount;
        addLog( "Subscription should live for " + lifetime + " ms" );

        var waitTime = lifetime - GIVETIME;
        addLog( "Waiting " + waitTime + " ms before checking subscription's life status" );
        wait( waitTime );
    }
    // Since we need to call deleteSubscriptions anyway, let's just use it to
    // validate if the subscription expired or not (i.e., the operation result
    // should be BadSubscriptionIdInvalid if the subscription expired before
    // its expected lifetime).
    deleteSubscription( subscription, g_session );
}

function createSubscription51001024Master()
{
    createSubscription5101024( 100, 10 );
    createSubscription5101024( 100, 30 );
    createSubscription5101024( 800, 15 );
}

safelyInvoke( createSubscription51001024Master );