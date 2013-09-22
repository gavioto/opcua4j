/*
    Description:
        Validates the HistoryRead() response by analyzing the parameters.

    Revision History:
        27-Sep-2010 NP: Initial Version.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_failed.js")
// the service is expected to fail

// This function checks if the server returned the expected error code
// Request is of Type UaReadRequest
// Response is of Type UaReadResponse
// ExpectedServiceResult is object of type ExpectedAndAcceptedResults (defined in Base/Objects/expectedResults.js)
function checkHistoryReadFailed( Request, Response, ExpectedServiceResults )
{
    // check in parameters
    if( arguments.length !== 3 )
    {
        addError( "function checkHistoryReadFailed(Request, Response, ExpectedServiceResults): Number of arguments must be 3" );
        return( false );
    }
    // check response header
    var result = checkResponseHeaderFailed( Request.RequestHeader, Response.ResponseHeader, ExpectedServiceResults );
    return( result );
}