include("./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js")

// the service is expected to succeed
// all operations are expected to succeed
function checkDeleteNodesValidParameter( Request, Response )
{
    var bSucceeded = true;
    
    // check in parameters
    if( arguments.length != 2 )
    {
        addError( "function checkDeleteNodesValidParameter(Request, Response): Number of arguments must be 2!" );
        bSucceeded = false;
    }
    
    // check response header
    bSucceeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader );

    // general checks state to check for Bad_SessionIdInvalid
    if( Response.ResponseHeader.ServiceResult.ServiceResult == StatusCode.BadSessionIdInvalid )
    {
        addError( "DeleteNodes returned: Bad_SessionIdInvalid" );
        bSucceeded = false;
    }
    
    return bSucceeded;
}