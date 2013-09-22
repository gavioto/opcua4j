/*
    Description:
        Validates the setPublishingMode response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP : REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js")

// the service is expected to succeed
// all operations are expected to succeed
function checkSetPublishingModeValidParameter( Request, Response )
{
    var bSucceeded = true;
    // check in parameters
    if( arguments.length !== 2 )
    {
        addError( "function checkSetPublishingModeValidParameter(Request, Response): Number of arguments must be 2!" );
        return false;
    }
    // as this is a valid parameter test we don't expect any diagnositcinfo        
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "SetPublishingModeResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        bSucceeded = false;
    }
    // check response header
    if( !checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader ) )
    {
        return false;
    }
    // check results        
    // check number of results
    if( Response.Results.length !== Request.SubscriptionIds.length )
    {
        addError( "The number of results does not match the number of SubscriptionIds." );
        addError( "SubscriptionIds.length = " + Request.SubscriptionIds.length + " Results.length = " + Response.Results.length );
        bSucceeded = false;
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
                bSucceeded = false;
            }             
        }
    }
    return bSucceeded;
}