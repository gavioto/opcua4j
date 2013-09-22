/*  Test 5.10.6 Error test 2 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Specifies multiple invalid subscriptionIds.
    Revision History
        25-Aug-2009 NP: Initial version.
        24-Nov-2009 NP: REVIEWED.
*/

function deleteSubscription5106err002()
{
    basicSubscription1 = new Subscription();
    basicSubscription2 = new Subscription();
    basicSubscription3 = new Subscription();
    basicSubscription4 = new Subscription();

    createSubscription( basicSubscription1, g_session );
    createSubscription( basicSubscription2, g_session );
    createSubscription( basicSubscription3, g_session );
    createSubscription( basicSubscription4, g_session );

    var deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
    var deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
    g_session.buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

    deleteSubscriptionRequest.SubscriptionIds[0] = basicSubscription1.SubscriptionId;
    deleteSubscriptionRequest.SubscriptionIds[1] = ( basicSubscription2.SubscriptionId + 0x1234 );
    deleteSubscriptionRequest.SubscriptionIds[2] = ( basicSubscription3.SubscriptionId + 0x2345 );
    deleteSubscriptionRequest.SubscriptionIds[3] = ( basicSubscription4.SubscriptionId + 0x3456 );

    print( "\nAbout to delete 4 subscriptions, the last 3 are INVALID." );
    for( var p=0; p<deleteSubscriptionRequest.SubscriptionIds.length; p++ )
    {
        print( "\tDeleting subscription id: " + deleteSubscriptionRequest.SubscriptionIds[p] );
    }

    var uaStatus = g_session.deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
    if( uaStatus.isGood() )
    {
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
        var ExpectedOperationResultsArray = [
            new ExpectedAndAcceptedResults( StatusCode.Good ),
            new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ),
            new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ),
            new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) ];
        checkDeleteSubscriptionsError( deleteSubscriptionRequest, deleteSubscriptionResponse, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "DeleteSubscriptions() status " + uaStatus, uaStatus );
    }

    // delete subscription added above
    deleteSubscription( basicSubscription2, g_session );
    deleteSubscription( basicSubscription3, g_session );
    deleteSubscription( basicSubscription4, g_session );
    //clean-up
    basicSubscription1 = null;
    basicSubscription2 = null;
    basicSubscription3 = null;
    basicSubscription4 = null;
}

safelyInvoke( deleteSubscription5106err002 );