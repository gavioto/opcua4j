/*  Test 5.10.3 Error test case 2 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Tries to disable publishing for a mix of valid and invalid subscriptionIds.
        
    Revision History
        01-Sep-2009 NP: Initial version.
        21-Oct-2009 NP: Migrated to use new script library objects.
        17-Nov-2009 NP: REVIEWED.
*/

function setPublishingMode5103Err002()
{
    const SUBSCRIPTIONCOUNT = 5;
    var subscriptions = [];
    // create all of the subscriptions first
    for( var s=0; s<SUBSCRIPTIONCOUNT; s++ )
    {
        subscriptions[s] = new Subscription();
        AssertEqual( true, createSubscription( subscriptions[s], g_session ) );
    }

    // set publishing mode
    var expectedResults = [];
    var setPublishing = new SetPublishingMode( g_session );
    for( var s=0; s<SUBSCRIPTIONCOUNT; s++ )
    {
        subscriptions[s].SubscriptionId += 0x1234;
        expectedResults[s] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
    }

    AssertEqual( true, setPublishing.Execute( subscriptions, false, expectedResults, true ) );

    // delete all subscriptions added above
    for( var s=0; s<SUBSCRIPTIONCOUNT; s++ )
    {
        subscriptions[s].SubscriptionId -= 0x1234;
        deleteSubscription( subscriptions[s], g_session );
    }
}

safelyInvoke( setPublishingMode5103Err002 );