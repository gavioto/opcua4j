/*
    Description:
        Validates the RegisterServer() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP : REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_failed.js")
// the service is expected to fail

// This function checks if the server returned the expected error code
// Request is of Type UaRegisterServerRequest
// Response is of Type UaRegisterServerResponse
// ExpectedServiceResult is object of type ExpectedAndAcceptedResults (defined in Base/Objects/expectedResults.js)
function checkRegisterServerFailed( Request, Response, ExpectedServiceResults )
{
    // check in parameters
    if( arguments.length !== 3 )
    {
        addError( "function checkRegisterServerFailed(Request, Response, ExpectedServiceResults): Number of arguments must be 3" );
        return( false );
    }
    // check response header
    return( checkResponseHeaderFailed( Request.RequestHeader, Response.ResponseHeader, ExpectedServiceResults ) );
}