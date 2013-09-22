/*  Test 5.10.6 Test 2 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Deletes multiple subscriptions.

    Revision History:
        25-Aug-2009 DEV: Initial version.
        24-Nov-2009 NP: REVIEWED.
*/

function deleteSubscription5106002()
{
    basicSubscription1 = new Subscription();
    basicSubscription2 = new Subscription( null, false );

    createSubscription( basicSubscription1, g_session );
    createSubscription( basicSubscription2, g_session );

    var deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
    var deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
    g_session.buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

    deleteSubscriptionRequest.SubscriptionIds[0] = basicSubscription1.SubscriptionId;
    deleteSubscriptionRequest.SubscriptionIds[1] = basicSubscription2.SubscriptionId;

    var uaStatus = g_session.deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
    if( uaStatus.isGood() )
    {
        checkDeleteSubscriptionsValidParameter( deleteSubscriptionRequest, deleteSubscriptionResponse );
    }
    else
    {
        addError( "DeleteSubscriptions() status " + uaStatus, uaStatus );
    }
    //clean-up
    basicSubscription1 = null;
    basicSubscription2 = null;
}

safelyInvoke( deleteSubscription5106002 );