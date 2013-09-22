/*    This class object is responsible for calling the GetEndpoints() service and for also
      performing any validation etc. This is a quick-use class.

      See the bottom of this file for an example on using it.

    Revision History
        04-Jan-2010 NP: Initial Version
*/

include( "./library/Base/Objects/expectedResults.js" )
include( "./library/ServiceBased/DiscoveryServiceSet/RegisterServer/check_registerServer_valid.js" );
include( "./library/ServiceBased/DiscoveryServiceSet/RegisterServer/check_registerServer_failed.js" );
include( "./library/Base/warnOnce.js" );

function RegisterServer( session )
{
    if( arguments.length !== 1 )
    {
        throw( "RegisterServer() instanciation failed, argument 'session' is missing or not a Session object." );
    }
    
    this.session = session;
    this.request = null;
    this.response = null;
    this.uaStatus = null;
    
    /* Reads values.
          Parameters are: */
    this.Execute = function( discoveryUrl, gatewayServerUri, isOnline, 
        productUri, semaphorePath, serverName, appType, serverUri, expectedErrors, suppressMessaging )
    {
        if( discoveryUrl === undefined || discoveryUrl === null ){ discoveryUrl = "127.0.0.1"; }
        if( gatewayServerUri === undefined || gatewayServerUri === null ){ gatewayServerUri = "www.opcfoundation.org/ua"; }
        if( isOnline === undefined || isOnline === null ){ isOnline = true; }
        if( productUri === undefined || productUri === null ){ productUri = "vendor:product:version"; }
        if( semaphorePath === undefined || semaphorePath === null ){ semaphorePath = "./SemaphoreFilePath"; }
        if( serverName === undefined || serverName === null ){ serverName = "CTT_ServerTestName"; }
        if( appType === undefined || appType === null ){ appType = ApplicationType.ClientAndServer; }
        if( serverUri === undefined || serverUri === null ){ serverUri = "ServerUri"; }

        if( suppressMessaging === undefined || suppressMessaging === false ) print( "RegisterServer.Execute()" );

        // define the headers
        this.request  = new UaRegisterServerRequest();
        this.response = new UaRegisterServerResponse();

        // configure the header request
        this.request.Server.DiscoveryUrls[0] = discoveryUrl;
        this.request.Server.GatewayServerUri = gatewayServerUri;
        this.request.Server.IsOnline = isOnline;
        this.request.Server.ProductUri = productUri;
        this.request.Server.SemaphoreFilePath = semaphorePath;
        this.request.Server.ServerNames[0] = serverName;
        this.request.Server.ServerType = appType;
        this.request.Server.ServerUri = serverUri;

        // issue the call
        this.uaStatus = this.session.registerServer( this.request, this.response );
        if( suppressMessaging === undefined || suppressMessaging === false ) print( "RegisterServer called. Result = " + this.uaStatus.toString() );

        // check result
        if( this.uaStatus.isGood() )
        {
            if( expectedErrors !== undefined && expectedErrors !== null )
            {
                result = checkRegisterServerFailed( this.request, this.response, expectedErrors );
            }
            else
            {
                result = checkRegisterServerValidParameter( this.request, this.response );
            }
        }
        else
        {
            addError( "RegisterServer() status " + uaStatus, uaStatus );
            result = false;
        }
        return( this.uaStatus.isGood() );
    };//RegisterServer Execute
}