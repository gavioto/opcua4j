/*  Test 5.10.6 Error test 3 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Specifies multiple subscriptionIds, some valid and others not.

    Revision History
        25-Aug-2009 NP: Initial version
        21-Oct-2009 NP: Migrated to use new script library objects.
        24-Nov-2009 NP: REVIEWED.
*/

function deleteSubscription5106Err003()
{
    var subscriptions = [
        new Subscription(),
        new Subscription(),
        new Subscription(),
        new Subscription()
        ];

    for( var s=0; s<subscriptions.length; s++ )
    {
        if( false === createSubscription( subscriptions[s], g_session ) )
        {
            return;
        }
    }

    var expectedResults = [
        new ExpectedAndAcceptedResults( StatusCode.Good ),
        new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ),
        new ExpectedAndAcceptedResults( StatusCode.Good ),
        new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) ];

    subscriptions[1].SubscriptionId += 0x1234;
    subscriptions[3].SubscriptionId += 0x1234;

    for( var d=0; d<subscriptions.length; d++ )
    {
        deleteSubscription( subscriptions[d], g_session, [expectedResults[d]] );
    }

    // delete subscription added above, first REVERT the subscriptionIds
    subscriptions[1].SubscriptionId -= 0x1234;
    subscriptions[3].SubscriptionId -= 0x1234;
    deleteSubscription( subscriptions[1], g_session );
    deleteSubscription( subscriptions[3], g_session );
    // clean-up
    expectedResults = null;
    subscriptions = null;
}

safelyInvoke( deleteSubscription5106Err003 );