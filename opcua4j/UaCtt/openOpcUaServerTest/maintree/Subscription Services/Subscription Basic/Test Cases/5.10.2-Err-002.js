/*  Test 5.10.2 Error Test case 2 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Modify an invalid subscription, subscriptionId=0.

    Revision History
        24-Aug-2009 NP: Initial version.
        20-Nov-2009 NP: REVIEWED.
*/

function modifySubscription5102Err002()
{
    var basicSubscription = new Subscription();
    if( createSubscription( basicSubscription, g_session ) )
    {
        // modify subscription
        var modifySubscriptionRequest = new UaModifySubscriptionRequest();
        var modifySubscriptionResponse = new UaModifySubscriptionResponse();
        g_session.buildRequestHeader( modifySubscriptionRequest.RequestHeader );

        modifySubscriptionRequest.RequestedPublishingInterval = 2000;
        modifySubscriptionRequest.SubscriptionId = 0; //injected error
        modifySubscriptionRequest.RequestedLifetimeCount = 30;
        modifySubscriptionRequest.RequestedMaxKeepAliveCount = 10;
        modifySubscriptionRequest.MaxNotificationsPerPublish = 0;
        modifySubscriptionRequest.Priority = 0;

        var uaStatus = g_session.modifySubscription( modifySubscriptionRequest, modifySubscriptionResponse );
        if( uaStatus.isGood() )
        {
            //we are expecting error Bad_SubscriptionIdInvalid;
            var ExpectedOperationResults = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
            checkModifySubscriptionFailed( modifySubscriptionRequest, modifySubscriptionResponse, ExpectedOperationResults );
        }
        else
        {
            addError( "ModifySubscription() status " + uaStatus, uaStatus );
        }
    }
    // delete the subscription we added here 
    deleteSubscription( basicSubscription, g_session );
}

safelyInvoke( modifySubscription5102Err002 );