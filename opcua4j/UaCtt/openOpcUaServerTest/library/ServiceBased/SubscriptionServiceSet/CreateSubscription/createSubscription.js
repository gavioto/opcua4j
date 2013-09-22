include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/check_createSubscription_valid.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/check_createSubscription_failed.js" );

/* create a subscription with the parameters specified in the Subscription object
   Revision History: 
       01-Jul-2009 DEV: Initial Version
       22-Mar-2010 NP: Added "TimeoutHint" calculation
*/
function createSubscription( Subscription, Session, expectedErrors )
{
    var bSucceeded = true;

    // check in parameters
    if( arguments.length < 2 )
    {
        addError( "function createSubscription(Subscription, Session): Number of arguments must be at least 2!" );
        return false;
    }

    if( Subscription.SubscriptionCreated == true)
    {
        addError( "function createSubscription(Subscription, Session): Subscription is already created." );
        return false;
    }

    var subscriptionReq = new UaCreateSubscriptionRequest();
    var subscriptionRes = new UaCreateSubscriptionResponse();
    Session.buildRequestHeader( subscriptionReq.RequestHeader );

    subscriptionReq.RequestedPublishingInterval = Subscription.PublishingInterval;
    subscriptionReq.RequestedLifetimeCount = Subscription.LifetimeCount;
    subscriptionReq.RequestedMaxKeepAliveCount = Subscription.MaxKeepAliveCount;
    subscriptionReq.MaxNotificationsPerPublish = Subscription.MaxNotificationsPerPublish;
    subscriptionReq.PublishingEnabled = Subscription.PublishingEnabled;
    subscriptionReq.Priority = Subscription.Priority;

    // get the defaultTimeoutHint from the settings
    var defaultTimeoutHintSettingValue = readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ).toString();
    subscriptionReq.RequestHeader.TimeoutHint = parseInt( defaultTimeoutHintSettingValue );

    print( "\tCreateSubscription Requested Parameters:" +
        "\n\t\tDefaultTimeoutHint: " + subscriptionReq.RequestHeader.TimeoutHint +
        "\n\t\tPublishingInterval: " + subscriptionReq.RequestedPublishingInterval +
        "\n\t\tLifetimeCount: " + subscriptionReq.RequestedLifetimeCount +
        "\n\t\tMaxKeepAliveCount: " + subscriptionReq.RequestedMaxKeepAliveCount +
        "\n\t\tPublishingEnabled: " + subscriptionReq.PublishingEnabled +
        "\n\t\tPriority: " + subscriptionReq.Priority +
        "\n\t\tMaxNotificationsPerPublish: " + subscriptionReq.MaxNotificationsPerPublish );

    var uaStatus = Session.createSubscription(subscriptionReq, subscriptionRes);
    Subscription.ServiceResult = subscriptionRes.ResponseHeader.ServiceResult;
    if( uaStatus.isGood() )
    {
        addLog( "\tCreated subscription: " + subscriptionRes.SubscriptionId );
        if( subscriptionRes.ResponseHeader.ServiceResult.isGood() )
        {
            Subscription.RevisedPublishingInterval  = subscriptionRes.RevisedPublishingInterval;
            Subscription.SubscriptionId             = subscriptionRes.SubscriptionId;
            Subscription.RevisedLifetimeCount       = subscriptionRes.RevisedLifetimeCount;
            Subscription.RevisedMaxKeepAliveCount   = subscriptionRes.RevisedMaxKeepAliveCount;
            Subscription.SubscriptionCreated = true;

            //store the revised values in the Revised properties of our subscription object
            Subscription.RevisedPublishingInterval = subscriptionRes.RevisedPublishingInterval;
            Subscription.RevisedLifetimeCount      = subscriptionRes.RevisedLifetimeCount;
            Subscription.RevisedMaxKeepAliveCount  = subscriptionRes.RevisedMaxKeepAliveCount;

            //calculate the "TimeoutHint" and store in the Subscription object
            Subscription.TimeoutHint = 2 * ( Subscription.RevisedPublishingInterval * Subscription.RevisedMaxKeepAliveCount );

            print( "\tCreateSubscription Revised Parameters:" +
                "\n\t\tRevisedPublishingInterval: " + subscriptionRes.RevisedPublishingInterval +
                "\n\t\tRevisedLifetimeCount: "      + subscriptionRes.RevisedLifetimeCount +
                "\n\t\tRevisedMaxKeepAliveCount: "  + subscriptionRes.RevisedMaxKeepAliveCount );
        }
        
        if( expectedErrors === undefined )
        {
            // do the parameter checks - this does not change the state of the subscription
            if(!checkCreateSubscriptionValidParameter( subscriptionReq, subscriptionRes ))
            {
                bSucceeded = false;
            }
        }// if( expectErrorNotFail === undefined )
        else
        {
            bSucceeded = checkCreateSubscriptionFailed( subscriptionReq, subscriptionRes, expectedErrors );
        }// else... if( expectErrorNotFail === undefined )
    }
    else
    {
        addError( "CreateSubscription() status " + uaStatus, uaStatus );
        bSucceeded = false;
    }
    return bSucceeded;
}