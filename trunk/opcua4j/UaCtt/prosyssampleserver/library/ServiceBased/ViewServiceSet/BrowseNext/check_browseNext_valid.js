// This not used anywhere that I know of. It was replaced by assert_browsenext_valid.js.

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );

// the service is expected to succeed
// all operations are expected to succeed
function checkBrowseNextValidParameter( Request, Response )
{
    var bSucceeded = true;
    
    // check in parameters
    if( arguments.length != 2 )
    {
        addError( "function checkBrowseNextValidParameter(): Number of arguments must be 2!" );
        return false;
    }

    // as this is a valid parameter test we don't expect any diagnositcinfo        
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "BrowseNextResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        bSucceeded = false;
    }
    
    // check response header
    bSucceeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader );
    
    // check results        
    // check number of results
    if( Response.Results.length != Request.ContinuationPoints.length )
    {
        addError( "The number of results does not match the number of ContinuationPoints." );
        addError( "ContinuationPoints.length = " + Request.ContinuationPoints.length + "; Results.length = " + Response.Results.length );
        bSucceeded = false;
    }
    else
    {        
        // check each result
        for( var i = 0; i < Response.Results.length; i++ )
        {
            var browseResult = Response.Results[i];
            
            // status code
            if( browseResult.StatusCode.isNotGood() )
            {
                addError( "Results[" + i + "].StatusCode is not good. ", browseResult.StatusCode );
                bSucceeded = false;
                continue;
            }
            
            // check for ReleaseContinuationPoints
            if( Request.ReleaseContinuationPoints === true )
            {
                if( !browseResult.ContinuationPoint.isEmpty() )
                {
                    addError( "Request.ReleaseContinuationPoints = true but Results[" + i + "].ContinuationPoint is not empty. " );
                    bSucceeded = false;
                    continue;
                }
                if( browseResult.References.length !== 0 )
                {
                    addError( "Request.ReleaseContinuationPoints = true but Results[" + i + "].References.length = " + browseResult.References.length );
                    bSucceeded = false;
                    continue;
                }
            }
        }
    }
        
    return bSucceeded;
}