/*  Test 5.10.6 Test 5 prepared by Anand Taparia; ataparia@kepwaare.com
    Description:
        Script deletes multiple subscriptions using the subscriptionIds of 
        subscriptions that have already been deleted.

    Revision History:
        22-Sep-2009 AT: Initial version.
        24-Nov-2009 NP: REVIEWED.
*/

function deleteSubscription5106Err005()
{
    const SUBSCRIPTIONSTOCREATE = 2;

    var basicSubscription;
    var SubscriptionIdList = new IntegerSet();
    var publishingInterval = 500;

    // Create subscriptions here
    for( var x=0; x<SUBSCRIPTIONSTOCREATE; x++ )
    {
        publishingInterval = publishingInterval * 2;
        basicSubscription = new Subscription( publishingInterval, true );
        createSubscription( basicSubscription, g_session );
        
        // Add the subscriptionID to our array
        SubscriptionIdList.insert( basicSubscription.SubscriptionId );
    }

    // Delete subscriptions here
    var deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
    var deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
    g_session.buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

    for( x=0; x<SUBSCRIPTIONSTOCREATE; x++)
    {
        deleteSubscriptionRequest.SubscriptionIds[x] = SubscriptionIdList.atIndex(x);
    }

    // First run at deleting the subscriptions should succeed
    var uaStatus = g_session.deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
    if( uaStatus.isGood() )
    {
        checkDeleteSubscriptionsValidParameter( deleteSubscriptionRequest, deleteSubscriptionResponse );
    }
    else
    {
        addError( "DeleteSubscriptions() status " + uaStatus, uaStatus );
    }

    // Second run at deleting the same subscriptions should fail
    uaStatus = g_session.deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
    if( uaStatus.isGood() )
    {
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
        var ExpectedOperationResultsArray = new Array(SUBSCRIPTIONSTOCREATE);
        for (x=0;x<SUBSCRIPTIONSTOCREATE;x++)
        {
            ExpectedOperationResultsArray[x] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
        }        
        checkDeleteSubscriptionsError( deleteSubscriptionRequest, deleteSubscriptionResponse, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "DeleteSubscriptions() status " + uaStatus, uaStatus );
    }
}

deleteSubscription5106Err005();