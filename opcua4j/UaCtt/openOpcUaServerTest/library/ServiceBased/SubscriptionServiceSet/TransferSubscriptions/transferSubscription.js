include( "./library/ServiceBased/SubscriptionServiceSet/TransferSubscriptions/check_transferSubscription_valid.js" );

function transferSubscriptionsHelper( sourceSession, destinationSession, subscriptions )
{
    this.SourceSession = sourceSession;
    this.DestinationSession = destinationSession;
    this.Subscriptions = subscriptions;
    this.Request = new UaTransferSubscriptionsRequest();
    this.Response = new UaTransferSubscriptionsResponse();
    
    // Transfer the Subscriptions from SourceSession to DestinationSession
    this.Execute = function()
    {
        // Build the RequestHeader to run on SourceSession with the AuthenticationToken
        // from the DestinationSession.
        this.DestinationSession.buildRequestHeader( this.Request.RequestHeader );
        //var tempRequest = new UaTransferSubscriptionsRequest();
        //this.SourceSession.buildRequestHeader( tempRequest.RequestHeader );
        //this.Request.RequestHeader.AuthenticationToken = tempRequest.RequestHeader.AuthenticationToken;
        
        for( var i = 0; i < this.Subscriptions.length; i++ )
        {
            this.Request.SubscriptionIds[i] = this.Subscriptions[i].SubscriptionId;
        }
        return this.DestinationSession.transferSubscriptions( this.Request, this.Response );
    };
    
    this.AssertSuccess = function( uaStatus )
    {
        if ( uaStatus.isGood() )
        {
            return checkTransferSubscriptionValidParameter( this.Request, this.Response );
        }
        else
        {
            addError( "transferSubscriptions() returned bad status: " + uaStatus, uaStatus );
            return false;
        }
    };
    
    this.ExecuteAndValidate = function()
    {
        return this.AssertSuccess( this.Execute() );
    };
}
