/*  Test 5.10.6 Error test 1 prepared by Development; compiance@opcfoundation.org
    Description:
        Specifies an invalid subscriptionId.

    Revision History
        25-Aug-2009 DEV: Initial version.
        24-Nov-2009 NP: REVIEWED.
*/

function deleteSubscription5106err001()
{
    basicSubscription1 = new Subscription();
    createSubscription( basicSubscription1, g_session );

    var deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
    var deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
    g_session.buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

    deleteSubscriptionRequest.SubscriptionIds[0] = basicSubscription1.SubscriptionId + 0x1234;

    var uaStatus = g_session.deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
    if( uaStatus.isGood() )
    {
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
        var ExpectedOperationResultsArray = [ new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) ];
        checkDeleteSubscriptionsError( deleteSubscriptionRequest, deleteSubscriptionResponse, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "deleteSubscriptions() returned bad status: " + uaStatus, uaStatus );
    }

    // delete subscription added above
    deleteSubscription( basicSubscription1, g_session );
    // clean-up
    basicSubscription1 = null;
}

safelyInvoke( deleteSubscription5106err001 );