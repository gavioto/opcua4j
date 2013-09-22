/*  Test 5.10.6 Error test 10 prepared by Development; compliance@opcfoundation.org
    Description:
        Specifies an empty subscriptionIds array.
        Expects "Bad_NothingToDo".

    Revision History:
        26-Aug-2009 DEV: Initial version.
        24-Nov-2009 NP: REVIEWED.
*/

function deleteSubscription5106err010()
{
    basicSubscription1 = new Subscription();
    basicSubscription2 = new Subscription( undefined, false );

    createSubscription( basicSubscription1, g_session );
    createSubscription( basicSubscription2, g_session );

    var deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
    var deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
    g_session.buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

    var uaStatus = g_session.deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
    if( uaStatus.isGood() )
    {
        var ExpectedServiceResults = new  ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        checkDeleteSubscriptionsFailed( deleteSubscriptionRequest, deleteSubscriptionResponse, ExpectedServiceResults );
    }
    else
    {
        addError( "DeleteSubscriptions() status " + uaStatus, uaStatus );
    }
    // delete subscription added above
    deleteSubscription( basicSubscription1, g_session );
    deleteSubscription( basicSubscription2, g_session );
}

safelyInvoke( deleteSubscription5106err010 );