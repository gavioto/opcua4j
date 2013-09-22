/*
    Description:
        Validates the Publish() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP : REVIEWED.
*/

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_failed.js" );
// the service is expected to fail

// This function checks if the server returned the expected error code
// Request is of Type UaPublishRequest
// Response is of Type UaPublishResponse
// ExpectedServiceResult is object of type ExpectedAndAcceptedResults (defined in Base/Objects/expectedResults.js)
function checkPublishFailed( Request, Response, ExpectedServiceResults )
{
    // check in parameters
    if( arguments.length !== 3 )
    {
        addError( "function checkPublishFailed(Request, Response, ExpectedServiceResults): Number of arguments must be 3" );
        return( false );
    }
    // check response header
    var success = checkResponseHeaderFailed( Request.RequestHeader, Response.ResponseHeader, ExpectedServiceResults );
    AssertEqual( 0, Response.Results.length, "Response.Results had more elements than expected." );
    AssertEqual( 0, Response.AvailableSequenceNumbers.length, "Response.Results had more elements than expected." );
    return success;
}