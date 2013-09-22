/*
    Description:
        Validates the SetMonitoringMode() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js")

// the service is expected to succeed
// all operations are expected to succeed
function checkSetMonitoringModeValidParameter( Request, Response )
{
    // check in parameters
    if( arguments.length !== 2 )
    {
        addError( "function checkSetMonitoringModeValidParameter(Request, Response): Number of arguments must be 2!" );
        return( false );
    }
    // as this is a valid parameter test we don't expect any diagnositcinfo        
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "SetMonitoringModeResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        return( false );
    }
    var result; 
    // check response header
    result = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader );
    // check results        
    // check number of results
    if( Response.Results.length !== Request.MonitoredItemIds.length )
    {
        addError( "The number of results does not match the number of MonitoredItemIds." );
        addError( "MonitoredItemIds.length = " + Request.MonitoredItemIds.length + " Results.length = " + Response.Results.length );
        result = false;
    }
    else
    {
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            // status code
            if( Response.Results[i].isNotGood() )
            {
                addError( "Results[" + i + "] is not good: " + Response.Results[i], Response.Results[i] );
                result = false;
            }
        }
    }
    // check diagnostic infos
    // no error is expected so the DiagnosticInfos should be empty
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "DiagnosticInfos are not empty" );
        addError( "DiagnosticInfos: " + DiagnosticInfos ); 
        result = false;
    }
    return( result );
}