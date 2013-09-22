/*  Test 5.10.3 Error test case 4 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Tries to enable publishing for an invalid subscriptionId.

    Revision History
        01-Sep-2009 NP: Initial version.
        21-Oct-2009 NP: Migrated to use new script library objects.
        17-Nov-2009 NP: REVIEWED.
*/

function setPublishingMode5103Err004()
{
    basicSubscription1 = new Subscription( null, false );
    
    if( createSubscription( basicSubscription1, g_session ) )
    {
        // break the subscriptionId in our object (We'll correct it when we delete the subscription)
        basicSubscription1.SubscriptionId += 0x1234;

        var expectedOperationResultsArray = [ new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) ];
        var setPublishing = new SetPublishingMode( g_session );
        setPublishing.Execute( [basicSubscription1], true, expectedOperationResultsArray, true );

        basicSubscription1.SubscriptionId -= 0x1234;
    }
    deleteSubscription( basicSubscription1, g_session );
}

safelyInvoke( setPublishingMode5103Err004 );