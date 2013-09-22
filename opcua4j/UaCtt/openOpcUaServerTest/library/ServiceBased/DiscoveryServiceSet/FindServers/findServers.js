/*    This class object is responsible for calling the FindServers() service and for also
      performing any validation etc. This is a quick-use class.

      See the bottom of this file for an example on using it.

    Revision History
        04-Jan-2010 NP: Initial Version
*/

include( "./library/Base/Objects/expectedResults.js" )
include( "./library/ClassBased/UaRequestHeader/createDefaultRequestHeader.js" );
include( "./library/ServiceBased/DiscoveryServiceSet/FindServers/check_findServers_valid.js" );
include( "./library/ServiceBased/DiscoveryServiceSet/FindServers/check_findServers_failed.js" );
include( "./library/Base/warnOnce.js" );

function FindServers( session )
{
    if( arguments.length !== 1 )
    {
        throw( "FindServers() instanciation failed, argument 'session' is missing or not a Session object." );
    }
    
    this.session = session;
    this.request = null;
    this.response = null;
    this.uaStatus = null;
    
    /* Reads values.
          Parameters are: 
              endpointUrl        = the endpoint
              locales            = array of locales
              serverUris         = array of ServerUris
              expectErrorNotFail = true means use check_read_error, else check_read_failed. */
    this.Execute = function( endpointUrl, locales, serverUris, expectedErrors, suppressMessaging )
    {
        print( "FindServers.Execute( " + endpointUrl + ")" );
        if( arguments.length < 1 )
        {
            throw( "FindServers.Execute() 1 or more arguments missing: 'endpointUrl, locales, serverUris'" );
        }

        // define the headers
        this.request  = new UaFindServersRequest();
        //this.session.buildRequestHeader( this.request.RequestHeader );
        this.session.RequestHeader = CreateDefaultRequestHeader();
        this.request.EndpointUrl = endpointUrl;
        this.request.LocaleIds = new UaStrings();
        this.request.ServerUris = new UaStrings();
        this.response = new UaFindServersResponse();

        // populate the LocaleIds and ServerUris, if applicable.
        if( locales !== undefined && locales !== null && locales.length > 0 )
        {
            if( suppressMessaging === undefined || suppressMessaging === false ) print( "... specifying " + locales.length + " locales in the request..." );
            for( var l=0; l<locales.length; l++ )
            {
                this.request.LocaleIds[l] = locales[l];
            }//for l
        }
        else
        {
            if( suppressMessaging === undefined || suppressMessaging === false ) print( "\tNo locale filters specified..." );
        }
        if( serverUris !== undefined && serverUris !== null && serverUris.length > 0 )
        {
            if( suppressMessaging === undefined || suppressMessaging === false ) print( "... specifying " + serverUris + " serverUris in the reqeuest..." );
            for( var s=0; s<serverUris.length; s++ )
            {
                this.request.ServerUris[s] = serverUris[s];
            }//for s
        }
        else
        {
            if( suppressMessaging === undefined || suppressMessaging === false ) print( "\tNo serverUri filters specified..." );
        }

        // issue the call
        this.uaStatus = this.session.findServers( this.request, this.response);
        if( suppressMessaging === undefined || suppressMessaging === false ) print( "FindServers called. Result = " + this.uaStatus.toString() );

        // check result
        if( this.uaStatus.isGood() )
        {
            if( expectedErrors !== undefined && expectedErrors !== null )
            {
                result = checkFindServersFailed( this.request, this.response, expectedErrors );
            }
            else
            {
                result = checkFindServersValidParameter( this.request, this.response );
            }
        }
        else
        {
            addError( "FindServers() status " + uaStatus, uaStatus );
            result = false;
        }
        return( this.uaStatus.isGood() );
    };//FindServers Execute
}