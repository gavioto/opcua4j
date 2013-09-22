include( "./library/ServiceBased/SubscriptionServiceSet/ModifySubscription/check_modifySubscription_valid.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/ModifySubscription/check_modifySubscription_error.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/ModifySubscription/check_modifySubscription_failed.js" );

/*    This class object is responsible for calling the ModifySubscription() service and for also
      performing any validation etc. This is a quick-use class.

      See the bottom of this file for an example on using it.

    Revision History
        21-Oct-2009 NP: Initial Version
*/
function ModifySubscription( sessionObject )
{
    if( arguments.length != 1 || sessionObject.SessionId == undefined )
    {
        throw( "Read() instanciation failed, argument 'sessionObject' is missing or not a Session object." );
    }

    this.session = sessionObject;
    this.modifySubscriptionRequest  = new UaModifySubscriptionRequest();
    this.modifySubscriptionResponse = new UaModifySubscriptionResponse();
    this.uaStatus = null;


    /*  Executes the call to ModifySubscription()
        Parameters:
            - subscription     - a subscription object
            - expectedErrors   - any errors expected. If received, the call will be expected to fail. */
    this.Execute = function( subscription, expectedErrors )
    {
        if( arguments.length < 1 )throw( "ModifySubscription().Execute() argument count mismatch." );
        if( subscription == undefined || subscription.SubscriptionId == undefined )throw( "ModifySubscription().Execute() argument 'subscription' is not valid." );

        var result = true;
        this.modifySubscriptionRequest = new UaModifySubscriptionRequest();
        this.modifySubscriptionResponse = new UaModifySubscriptionResponse();
        this.session.buildRequestHeader( this.modifySubscriptionRequest.RequestHeader );

        this.modifySubscriptionRequest.RequestedPublishingInterval = subscription.PublishingInterval;
        this.modifySubscriptionRequest.SubscriptionId              = subscription.SubscriptionId;
        this.modifySubscriptionRequest.RequestedLifetimeCount      = subscription.LifetimeCount;
        this.modifySubscriptionRequest.RequestedMaxKeepAliveCount  = subscription.MaxKeepAliveCount;
        this.modifySubscriptionRequest.MaxNotificationsPerPublish  = subscription.MaxNotificationsPerPublish;
        this.modifySubscriptionRequest.Priority                    = subscription.Priority;

        print( "\tModifying subscription as follows: " +
            "\n\t\tPublishingInterval: " + this.modifySubscriptionRequest.RequestedPublishingInterval +
            "\n\t\tLifetimeCount: " + this.modifySubscriptionRequest.RequestedLifetimeCount +
            "\n\t\tMaxKeepAliveCount: " + this.modifySubscriptionRequest.RequestedMaxKeepAliveCount +
            "\n\t\tMaxNotificationsPerPublish: " + this.modifySubscriptionRequest.MaxNotificationsPerPublish +
            "\n\t\tPriority: " + this.modifySubscriptionRequest.Priority );
        this.uaStatus = this.session.modifySubscription( this.modifySubscriptionRequest, this.modifySubscriptionResponse );
        if( this.uaStatus.isGood() )
        {
            if( expectedErrors === undefined )
            {
                if( checkModifySubscriptionValidParameter( this.modifySubscriptionRequest, this.modifySubscriptionResponse ) )
                {
                    subscription.RevisedLifetimeCount      = this.modifySubscriptionResponse.RevisedLifetimeCount;
                    subscription.RevisedMaxKeepAliveCount  = this.modifySubscriptionResponse.RevisedMaxKeepAliveCount;
                    subscription.RevisedPublishingInterval = this.modifySubscriptionResponse.RevisedPublishingInterval;
                    print( "\tModify Subscription REVISED values: " +
                        "\n\t\tRevisedPublishingInterval: " + subscription.RevisedPublishingInterval +
                        "\n\t\tRevisedMaxKeepAliveCount: " + subscription.RevisedMaxKeepAliveCount +
                        "\n\t\tRevisedLifetimeCount: " + subscription.RevisedLifetimeCount );
                }
                else
                {
                    result = false;
                }
            }
            else
            {
                result = checkModifySubscriptionFailed( this.modifySubscriptionRequest, this.modifySubscriptionResponse, expectedErrors );
            }
        }
        else
        {
            addError( "ModifySubscription() status " + this.uaStatus, this.uaStatus );
            result = false;
        }
        return( result );
    }// Execute()
}


/* EXAMPLES */


/* TESTING
// no parameter = throw exception
try{ var m=new ModifySubscription();}catch(e){print("threw error as expected.");}
// invalid subscriptionObject
try{ var m=new ModifySubscription("hello");}catch(e){print("thew error as expected.");}*/