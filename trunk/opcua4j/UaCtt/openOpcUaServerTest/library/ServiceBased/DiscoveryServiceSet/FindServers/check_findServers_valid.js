/*
    Revision History:
        Oct-01-2009 DEV: Initial Release.
        Nov-23-2009 NP:  REVIEWED.
*/

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );
include( "./library/Base/warnOnce.js" );

/*
The service is expected to succeed
All operations are expected to succeed */
function checkFindServersValidParameter( Request, Response, suppressMessaging )
{
    var succeeded = true;
    // check in parameters
    if( arguments.length !== 2 )
    {
        addError( "function checkFindServersValidParameter(): Number of arguments must be 2!" );
        return false;
    }
    // check response header
    if (!checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader ))
    {
      addError( "Response header is invalid." );
      succeeded = false;
    }
    // check application descriptions.
    if( suppressMessaging === undefined || suppressMessaging === false ) print( "FindServers returned " + Response.Servers.length + " Servers:" );
    for( var i=0; i<Response.Servers.length; i++)
    {
      var description = Response.Servers[i];
      if( suppressMessaging === undefined || suppressMessaging === false ) print( "\t" + i + ". " + description.toString() );
      // check that application name is not empty.
/*      if (description.ApplicationName.Locale.length == 0)
      {
        addError( "function checkFindServersValidParameter(): application name (locale) is empty." );        
        succeeded = false;
      }      */
      if (description.ApplicationName.Text.length == 0)
      {
        addError( "function checkFindServersValidParameter(): application name (text) is empty." );        
        succeeded = false;
      }
      // check that application uri is not empty.
      if (description.ApplicationUri.length == 0)
      {
        addError( "function checkFindServersValidParameter(): application uri is empty." );        
        succeeded = false;
      }      
      // check that product uri is not empty.
      if (description.ProductUri.length == 0)
      {
        addError( "function checkFindServersValidParameter(): product uri is empty." );        
        succeeded = false;
      }       
      // check that application type is not client.
      if (description.ApplicationType == ApplicationType.Client)
      {
        addError( "function checkFindServersValidParameter(): application type is client." );        
        succeeded = false;
      }
    }
    return succeeded;
}