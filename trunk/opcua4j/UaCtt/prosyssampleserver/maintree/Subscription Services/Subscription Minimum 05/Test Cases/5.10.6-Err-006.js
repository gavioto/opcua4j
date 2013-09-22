/*  Test 5.10.6 Error Test 6 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script deletes multiple subscriptions where some are valid subscriptionIds 
        and others are the subscriptionIds of subscriptions that have already been deleted.

    Revision History:
        22-Sep-2009 AT: Initial version.
        24-Nov-2009 NP: REVIEWED.
*/

function deleteSubscription5106err006()
{
    const SUBSCRIPTIONSTOCREATE = 5;

    var basicSubscription;
    var subscriptionIdList = new IntegerSet();
    var deletedSubscriptionIdIndexList = new IntegerSet();
    // Has to be in the range 0 - (SUBSCRIPTIONSTOCREATE - 1)
    deletedSubscriptionIdIndexList.insert ( 0 );
    deletedSubscriptionIdIndexList.insert ( 2 );
    deletedSubscriptionIdIndexList.insert ( 4 );
    var publishingInterval = 500;

    // Create subscriptions here
    for (var x=0;x<SUBSCRIPTIONSTOCREATE;x++)
    {
        publishingInterval = publishingInterval * 2;
        basicSubscription = new Subscription( publishingInterval, true );
        createSubscription( basicSubscription, g_session );
        
        // Add the subscriptionID to our list
        subscriptionIdList.insert( basicSubscription.SubscriptionId );
    }

    // Delete subscriptions here
    var deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
    var deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
    g_session.buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

    var subscriptionsToDelete = deletedSubscriptionIdIndexList.size();
    for(x=0;x<subscriptionsToDelete;x++ )
    {
        deleteSubscriptionRequest.SubscriptionIds[x] = subscriptionIdList.atIndex( deletedSubscriptionIdIndexList.atIndex( x ) );
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

    // In the second run, delete all the subscriptions. Some should succeed and some should fail
    for (x=0;x<SUBSCRIPTIONSTOCREATE;x++)
    {
        deleteSubscriptionRequest.SubscriptionIds[x] = subscriptionIdList.atIndex(x);
    }
    uaStatus = g_session.deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
    if( uaStatus.isGood() )
    {
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
        var ExpectedOperationResultsArray = new Array(SUBSCRIPTIONSTOCREATE);
        // Set all good first
        for (x=0;x<SUBSCRIPTIONSTOCREATE;x++)
        {
            ExpectedOperationResultsArray[x] = new ExpectedAndAcceptedResults( StatusCode.Good );
        }
        // For the ones that have already been deleted, set the status to Bad_SubscriptionIdInvalid.
        subscriptionsToDelete = deletedSubscriptionIdIndexList.size();
        for(x=0;x<subscriptionsToDelete;x++ )
        {
            ExpectedOperationResultsArray [deletedSubscriptionIdIndexList.atIndex(x)] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
        }
        checkDeleteSubscriptionsError( deleteSubscriptionRequest, deleteSubscriptionResponse, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "DeleteSubscriptions() status " + uaStatus, uaStatus );
    }
}

safelyInvoke( deleteSubscription5106err006 );