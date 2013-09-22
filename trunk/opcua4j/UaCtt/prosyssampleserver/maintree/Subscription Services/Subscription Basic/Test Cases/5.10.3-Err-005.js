/*  Test 5.10.3 Error test case 5 prepared by Development; compliance@opcfoundation.org

    Description:
        Tries to enable publishing for multiple invalid subscriptions.

    Revision History
        24-Aug-2009 DEV: Initial version.
        17-Nov-2009  NP: REVIEWED.
*/

function setPublishingMode5103Err005()
{
    var subscriptions = [ new Subscription( null, false ), new Subscription( null, false ) ];
    if( !AssertEqual( true, createSubscription( subscriptions[0], g_session ) ) )
    {
        return;
    }
    if( !AssertEqual( true, createSubscription( subscriptions[1], g_session ) ) )
    {
        return;
    }

    // break the subscriptionIds, we'll correct them when we delete the subscriptions
    subscriptions[0].SubscriptionId += 0x1234;
    subscriptions[1].SubscriptionId += 0x1234;

    // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
    var expectedResults = new Array( 1 );
    expectedResults[0] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
    expectedResults[1] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );

    var setPublishing = new SetPublishingMode( g_session );
    setPublishing.Execute( subscriptions, true, expectedResults, true );

    // delete all subscriptions added above, but correct the subscriptionIds first
    subscriptions[0].SubscriptionId -= 0x1234;
    subscriptions[1].SubscriptionId -= 0x1234;
    deleteSubscription( subscriptions[0], g_session );
    deleteSubscription( subscriptions[1], g_session );
}

safelyInvoke( setPublishingMode5103Err005 );