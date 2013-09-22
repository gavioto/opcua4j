/*  Test 5.10.6 Test 1 prepared by Development; compliance@opcfoundation.org
    Description:
        Deletes a single subscription.

    Revision History
        25-Aug-2009 DEV: Initial version.
        24-Nov-2009 NP: REVIEWED.
*/

function deleteSubscription5106001()
{
    basicSubscription1 = new Subscription();
    if( createSubscription( basicSubscription1, g_session ) )
    {
        var deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
        var deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
        g_session.buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

        deleteSubscriptionRequest.SubscriptionIds[0] = basicSubscription1.SubscriptionId;

        var uaStatus = g_session.deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
        if( uaStatus.isGood() )
        {
            checkDeleteSubscriptionsValidParameter( deleteSubscriptionRequest, deleteSubscriptionResponse );
        }
        else
        {
            addError( "DeleteSubscriptions() status " + uaStatus, uaStatus );
        }
    }
    //clean-up
    basicSubscription1 = null;
}

safelyInvoke( deleteSubscription5106001 );