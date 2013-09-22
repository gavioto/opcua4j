include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/check_setPublishingMode_valid.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/check_setPublishingMode_error.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/check_setPublishingMode_failed.js" );

/*    This class object is responsible for calling the SetPublishingMode() service and for also
      performing any validation etc. This is a quick-use class.

      See the bottom of this file for an example on using it.

    Revision History
        16-Oct-2009 NP: Initial Version
*/
function SetPublishingMode( sessionObject )
{

    this.SetPublishingModeRequest;
    this.SetPublishingModeResponse;
    this.session  = null;
    this.uaStatus = null;
    
    if( arguments.length == 0 )
    {
        throw( "SetPublishingMode() initialization error, incorrect argument count." );
    }
    else
    {
        this.session = sessionObject;
    }

    // Sets the publishing mode of the specified subscriptionIds
    // Parameters:
    //   subscriptionIds    - [REQUIRED] an array/single instance of an integer (subscriptionId)
    //   publishingEnabled  - [REQUIRED] true/false
    //   session            - [REQUIRED] session object
    //   expectedErrors     - an array of ExpectedAndAcceptedErrors
    //   errorExpected      - true/false, true means invoke error; false means failed
    this.Execute = function( subscriptions, publishingEnabled, expectedErrors, errorExpected )
    {
        if( arguments.length < 2 )
        {
            throw( "Invalid argument length < 2 in '.SetPublishingMode'" );
        }

        var result; // return flag

        this.SetPublishingModeRequest  = new UaSetPublishingModeRequest();
        this.SetPublishingModeResponse = new UaSetPublishingModeResponse();
        this.session.buildRequestHeader( this.SetPublishingModeRequest.RequestHeader );
        this.SetPublishingModeRequest.PublishingEnabled = publishingEnabled;

        // specify the subscriptions to alter
        if( subscriptions.length !== undefined )
        {
            if( subscriptions[0].SubscriptionId === undefined )
            {
                throw( "Invalid argument specified in 'SetPublishingMode.Execute()'" );
            }
            for( var s=0; s<subscriptions.length; s++ )
            {
                this.SetPublishingModeRequest.SubscriptionIds[s] = subscriptions[s].SubscriptionId;
                print( "\tSet publishingEnabled = " + publishingEnabled + " for subscriptionId: " + subscriptions[s].SubscriptionId );
            }// for s...
        }
        else
        {
            if( subscriptions.SubscriptionId === undefined )
            {
                throw( "Invalid argument specified in 'SetPublishingMode.Execute()'" );
            }
            // turn into an array
            subscriptions = [subscriptions];
            this.SetPublishingModeRequest.SubscriptionIds[0] = subscriptions[0].SubscriptionId;
        }

        print( "\tSetPublishingMode: Mode=" + publishingEnabled + "; on " + subscriptions.length + " subscription(s)." );
        this.uaStatus = this.session.setPublishingMode( this.SetPublishingModeRequest, this.SetPublishingModeResponse );
        if( this.uaStatus.isGood() )
        {
            // check if we expect success or error (see last 2 params)
            if( expectedErrors != undefined && errorExpected != undefined )
            {
                if( errorExpected )
                {
                    result = checkSetPublishingModeError( this.SetPublishingModeRequest, this.SetPublishingModeResponse, expectedErrors );
                }//if errorExpected
                else
                {
                    result = checkSetPublishingModeFailed( this.SetPublishingModeRequest, this.SetPublishingModeResponse, expectedErrors );
                }//else.. if errorExpected
            }// if expectedErrors && errorExpected...
            else
            {
                result = checkSetPublishingModeValidParameter( this.SetPublishingModeRequest, this.SetPublishingModeResponse );
            }// else... if expectedErrors && errorExpected...
            
            // go through and update the subscriptions that were successfully modified.
            for( var r=0; r<this.SetPublishingModeResponse.Results.length; r++ )
            {
                if( this.SetPublishingModeResponse.Results[r].isGood() )
                {
                    subscriptions[r].PublishingEnabled = publishingEnabled;
                }
            }
        }
        else
        {
            addError( "SetPublishingMode() status " + this.uaStatus, this.uaStatus );
            result = false;
        }
        return( result );
    }// SetPublishingMode()
}