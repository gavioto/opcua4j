/*
    Description:
        Validates the CreateMonitoredItems() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js")

// the service is expected to succeed
// all operations are expected to succeed
function checkCreateMonitoredItemsValidParameter( Request, Response, suppressMessaging )
{
    var bSucceeded = true;
    // check in parameters
    if( arguments.length < 2 )
    {
        addError( "function checkCreateMonitoredItemsValidParameter(Request, Response): Number of arguments must be 2!" );
        return false;
    }
    // as this is a valid parameter test we don't expect any diagnositcinfo        
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "CreateMonitoredItemsResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        return false;
    }
    // check response header
    bSucceeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader, undefined, undefined, suppressMessaging );
    // check results        
    // check number of results
    if( Response.Results.length !== Request.ItemsToCreate.length )
    {
        addError( "The number of results does not match the number of ItemsToCreate. ItemsToCreate.length = " + Request.ItemsToCreate.length + " Results.length = " + Response.Results.length );
        bSucceeded = false;
    }
    else
    {
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            var monitoredItemsCreateResult = Response.Results[i];
            // status code
            if( monitoredItemsCreateResult.StatusCode.isNotGood() )
            {
                addError( "Results[" + i + "].monitoredItemsCreateResult.StatusCode is not good: " + monitoredItemsCreateResult.StatusCode, monitoredItemsCreateResult.StatusCode );
                bSucceeded = false;
            }
        }
    }
    // check diagnostic infos
    // no error is expected so the DiagnosticInfos should be empty
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "DiagnosticInfos are not empty. DiagnosticInfos: " + DiagnosticInfos );
        bSucceeded = false;
    }
    return bSucceeded;
}