/*  Test 5.10.3 Error test case 1 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Tries to disable publishing for an invalid subscriptionId.

    Revision History
        01-Sep-2009 NP: Initial version.
        17-Nov-2009 NP: REVIEWED.
*/

function setPublishingMode5103Err001()
{
    basicSubscription1 = new Subscription();
    if( createSubscription( basicSubscription1, g_session ) )
    {
        // invalidate the subscriptinId inside of our object
        basicSubscription1.SubscriptionId += 0x1234;

        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
        var ExpectedOperationResultsArray = new Array( 1 );
        ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );

        // set publishing mode
        var setPublishing = new SetPublishingMode( g_session );
        setPublishing.Execute( [ basicSubscription1 ], false, ExpectedOperationResultsArray, true );

        // delete all subscriptions added above, but correct the subscriptionId first...
        basicSubscription1.SubscriptionId -= 0x1234;
    }
    deleteSubscription( basicSubscription1, g_session );
}

safelyInvoke( setPublishingMode5103Err001 );