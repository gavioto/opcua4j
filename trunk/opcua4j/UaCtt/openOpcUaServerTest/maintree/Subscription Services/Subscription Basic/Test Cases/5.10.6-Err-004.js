/*  Test 5.10.6 Error test 4 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Specifies an already deleted subscriptionId.
    Revision History
        25-Aug-2009 NP: Initial version.
        24-Nov-2009 NP: REVIEWED.
*/

function deleteSubscription5106err004()
{
    basicSubscription1 = new Subscription();
    createSubscription( basicSubscription1, g_session );

    var deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
    var deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
    g_session.buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

    deleteSubscriptionRequest.SubscriptionIds[0] = basicSubscription1.SubscriptionId;

    //first run at deleting the subscription SHOULD WORK!
    var uaStatus = g_session.deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
    if( uaStatus.isGood() )
    {
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
        var ExpectedOperationResultsArray = new Array(1);
        ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
        
        checkDeleteSubscriptionsError( deleteSubscriptionRequest, deleteSubscriptionResponse, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "DeleteSubscriptions() status " + uaStatus, uaStatus );
    }

    //second run at deleting the same subscription SHOULD FAIL!
    uaStatus = g_session.deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
    if( uaStatus.isGood() )
    {
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
        var ExpectedOperationResultsArray = new Array(1);
        ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
        checkDeleteSubscriptionsError( deleteSubscriptionRequest, deleteSubscriptionResponse, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "DeleteSubscriptions() status " + uaStatus, uaStatus );
    }
}

safelyInvoke( deleteSubscription5106err004 );