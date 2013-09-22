/*
    Description:
        Validates the ModifyMonitoredItems() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js")

// the service is expected to succeed
// all operations are expected to succeed
function checkModifyMonitoredItemsValidParameter( Request, Response, suppressMessaging )
{
    // check in parameters
    if ( arguments.length < 2 )
    {
        addError( "function checkModifyMonitoredItemsValidParameter(Request, Response): Number of arguments must be 2!" );
        return( false );
    }
    // as this is a valid parameter test we don't expect any diagnositcinfo        
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "ModifyMonitoredItemsResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        return( false );
    }
    var success = true;
    // check response header
    if( !checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader, undefined, undefined, suppressMessaging ) )
    {
        success = false;
    }
    // check results        
    // check number of results
    if( Response.Results.length !== Request.ItemsToModify.length )
    {
        addError( "The number of results does not match the number of ItemsToModify." );
        addError( "ItemsToModify.length = " + Request.ItemsToModify.length + " Results.length = " + Response.Results.length );
    }
    else
    {
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            var monitoredItemModifyResult = Response.Results[i];
            // status code
            if( monitoredItemModifyResult.StatusCode.isNotGood() )
            {
                addError( "Results[" + i + "].monitoredItemModifyResult.StatusCode is not good: " + monitoredItemModifyResult.StatusCode, monitoredItemModifyResult.StatusCode );
                success = false;
            }
        }
    }
    // check diagnostic infos
    // no error is expected so the DiagnosticInfos should be empty
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "DiagnosticInfos are not empty" );
        addError( "DiagnosticInfos: " + DiagnosticInfos );
        success = false;
    }
    return( success );
}