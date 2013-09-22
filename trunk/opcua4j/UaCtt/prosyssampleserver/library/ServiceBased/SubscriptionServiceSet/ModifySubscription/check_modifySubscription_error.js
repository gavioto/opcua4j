/*
    Description:
        Validates the subscription modification by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP : REVIEWED.
*/

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_error.js" );

// the service is expected to succeed
// one, some or all operations are expected to fail

// This function checks if the server returned the expected error codes
// Request is of Type UaModifySubscriptionRequest
// Response is of Type UaModifySubscriptionResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/Objects/expectedResults.js)
function checkModifySubscriptionError( Request, Response, ExpectedOperationResultsArray )
{
    // check in parameters
    if( arguments.length !== 3 )
    {
        addError( "function checkModifySubscriptionError(Request, Response, ExpectedOperationResultsArray): Number of arguments must be 3" );
        return( false );
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length !== 1 )
    {
        addError( "function checkModifySubscriptionError(): ExpectedOperationResultsArray[] must have size 1" );
        return( false );
    }
    // check response header
    return( checkResponseHeaderError( Request.RequestHeader, Response.ResponseHeader, ExpectedOperationResultsArray ) );
}