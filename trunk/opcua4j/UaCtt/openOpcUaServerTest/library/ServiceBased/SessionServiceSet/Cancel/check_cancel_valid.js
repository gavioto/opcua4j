/*
    Description:
        Validates the Cancel() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js")

// the service is expected to succeed
// all operations are expected to succeed
function checkCancelValidParameter( Request, Response )
{
    var bSucceeded = true;
    // check in parameters
    if ( arguments.length !== 2 )
    {
        addError( "function checkCancelValidParameter(): Number of arguments must be 2!" );
        return( false );
    }
    // check response header
    checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader );
    return bSucceeded;
}