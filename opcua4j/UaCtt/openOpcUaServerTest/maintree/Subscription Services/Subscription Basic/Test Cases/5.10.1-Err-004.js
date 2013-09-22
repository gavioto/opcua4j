/*  Test 5.10.1 Error Test 4, prepared by Dale Pope; dale.pope@matrikon.com
    Description:
          Given a valid subscription
            And an amount of time equal to the subscription's expiry time passes
          When Publish is called
          Then a StatusChangeNotification of Bad_Timeout is returned

          When a service requiring the SubscriptionId is called
          Then the service fails

    Revision History
        2009-10-20 DP: Initial version.
        2009-11-20 NP: REVIEWED.
        2010-05-03 NP: Revised to test just once, instead of using multiple parameters.
        2010-06-09 NP: Corrected lifetime calculation to use * instead of + (thanks Hannes)
*/

function createSubscription5101Err004( publishingInterval, lifetimeCount )
{
    const GIVETIME = 5000; // amount of time to allow the server to be late by 
    var expectedError;
    var subscriptionErr004 = new Subscription( publishingInterval, true, lifetimeCount, Math.floor( lifetimeCount / 3 ) );
    if( createSubscription( subscriptionErr004, g_session ) )
    {
        var lifetime; // the lifetime in milliseconds
        lifetime = subscriptionErr004.RevisedPublishingInterval * subscriptionErr004.RevisedLifetimeCount;
        addLog( "Subscription should live for " + lifetime + " ms, plus an addition " + GIVETIME + "ms will be added to account for low-priority threads typically associated with clean-up operations like this." );

        var waitTime = lifetime + GIVETIME;
        addLog( "Waiting " + waitTime + " ms before checking subscription's life status" );
        wait( waitTime );

        // Call Publish to validate the StatusChangeNotification was generated
        publishService.Execute();
        if( AssertEqual( 1, publishService.CurrentStatusChanges.length, "Number of StatusChangeNotifications was incorrect (StatusChange is not the same as a DataChange)." ) )
        {
            AssertStatusCodeIs( StatusCode.BadTimeout, publishService.CurrentStatusChanges[0].Status, "Received StatusChangeNotification was not BadTimeout" );
        }
        
        // Since we should call deleteSubscriptions if the subscription doesn't expire,
        // let's use it to validate if the subscription expired or not (i.e., the 
        // operation result should be BadSubscriptionIdInvalid if the subscription 
        // expired before its expected lifetime).
        expectedError = [ new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) ];
    }
    deleteSubscription( subscriptionErr004, g_session, expectedError );
    publishService.Clear();
}

safelyInvoke( createSubscription5101Err004( 800, 15 ) );