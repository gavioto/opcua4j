/*  Test 5.10.1 Error test 002 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Creates the MAX number of supported subscriptions using the default parameters.
        Then tries to create one more.
        Expecting a Bad_TooManySubscriptions result.

    Revision History
        09-Sep-2009 NP: Initial version.
        20-Nov-2009 NP: REVIEWED/INCONCLUSIVE. No way to test that this script works.
        18-Feb-2011 DP: Changed RequestedLifetimeCount to try to ensure that the subscriptions
                        created will last for the duration of the test.
        23-Feb-2011 DP: Changed to delete the extra subscription (if it was created).

    MORE INFORMATION:
        Refer to Test Lab Part 8 specifications, section 5.10.1.
*/

function createSubscription5101Err002()
{
    var maxSubscriptionCount = parseInt( readSetting( "/Server Test/Max Supported Subscriptions" ).toString() );
    print( "Testing MAX # of supported Subscriptions: " + maxSubscriptionCount );
    
    var subscriptions = [];

    // first: create the max # of subscriptions allowed
    for( var i=0; i<maxSubscriptionCount; i++ )
    {
        addLog( ( i + 1 ) + " of " + maxSubscriptionCount + " subscriptions being created..." );
        var subscription = new Subscription( null, null, 15+maxSubscriptionCount, 5, 0, 0 );
        if( createSubscription( subscription, g_session ) )
        {
            subscriptions[i] = subscription;
        }
    }// for i...
    addLog( "All " + maxSubscriptionCount + " subscriptions created (as specified as the max # supported).\nNow to add one more subscription, which we expect to fail..." );

    // now to add one more subscription, which should fail!
    var subscriptionToFail = new Subscription( null, null, 15, 5, 0, 0 );
    var expectedResults = new ExpectedAndAcceptedResults( StatusCode.BadTooManySubscriptions );
    expectedResults.addAcceptedResult( StatusCode.Good );
    createSubscription( subscriptionToFail, g_session, expectedResults );
    if( subscriptionToFail.SubscriptionCreated )
    {
        deleteSubscription( subscriptionToFail, g_session );
    }
    for( var i=0; i<maxSubscriptionCount; i++ )
    {
        deleteSubscription( subscriptions[i], g_session );
    }
}

safelyInvoke( createSubscription5101Err002 );