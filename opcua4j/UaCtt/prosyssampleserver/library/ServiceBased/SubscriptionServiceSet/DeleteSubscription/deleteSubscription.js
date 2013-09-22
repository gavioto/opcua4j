include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/check_deleteSubscription_valid.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/check_deleteSubscription_error.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/check_deleteSubscription_failed.js" );

// delete a subscription
function deleteSubscription( Subscription, Session, expectedErrors )
{
    var result = true;
    // check in parameters
    if ( arguments.length < 2 )
    {
        addError( "function deleteSubscription(Subscription, Session): Number of arguments must be by minimum 2!" );
        return( false );
    }

    if( Subscription == null || Subscription == undefined )
    {
        return;
    }
    
    if( Subscription.SubscriptionCreated )
    {
        addLog( "Deleting subscription: " + Subscription.SubscriptionId );

        // delete subscription
        var deleteSubscriptionsReq = new UaDeleteSubscriptionsRequest();
        var deleteSubscriptionsRes = new UaDeleteSubscriptionsResponse();
        Session.buildRequestHeader(deleteSubscriptionsReq.RequestHeader);

        deleteSubscriptionsReq.SubscriptionIds[0] = Subscription.SubscriptionId;

        uaStatus = Session.deleteSubscriptions( deleteSubscriptionsReq, deleteSubscriptionsRes );
        if( uaStatus.isGood() )
        {
            if( deleteSubscriptionsRes.ResponseHeader.ServiceResult.isGood() )
            {
                Subscription.SubscriptionCreated = false;
            }
            
            if( expectedErrors === undefined )
            {
                result = checkDeleteSubscriptionsValidParameter( deleteSubscriptionsReq, deleteSubscriptionsRes );
            }
            else
            {
                result = checkDeleteSubscriptionsError( deleteSubscriptionsReq, deleteSubscriptionsRes, expectedErrors );
            }
        }
        else
        {
            addError( "session.deleteSubscription() returned bad status: " + uaStatus, uaStatus );
            result = false;
        }
    }
    return( result );
}