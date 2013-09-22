/*global include, AssertEqual, checkResponseHeaderError, AssertStatusCodeIsOneOf,
  checkDiagnosticInfosError
*/

include( "./library/Base/assertions.js" );
include( "./library/ClassBased/UaResponseHeader/check_responseHeader_error.js" );
include( "./library/ClassBased/UaDiagnosticInfo/check_diagnosticInfos_error.js" );

// The service is expected to succeed;
// one, some or all operations are expected to fail.

// This function checks if the server returned the expected error codes
// request is of Type UaBrowseRequest
// response is of Type UaBrowseResponse
// expectedOperationResultsArray is an array of ExpectedAndAcceptedResult (defined in Base/Objects/expectedResults.js)
function assertBrowseError( request, response, expectedOperationResultsArray )
{
    if ( !AssertEqual(3, arguments.length, "checkBrowseError(): Number of arguments must be 3") )
    {
        return;
    }

    // expectedOperationResultsArray needs to have the correct size
    if ( !AssertEqual(request.NodesToBrowse.length, expectedOperationResultsArray.length, "checkBrowseError(): expectedOperationResultsArray[] must have the same size as request.NodesToBrowse[]") )
    {
        return;
    }

    // check response header
    checkResponseHeaderError( request.RequestHeader, response.ResponseHeader, expectedOperationResultsArray );

    // check results
    // check number of results
    if( AssertEqual( response.Results.length, request.NodesToBrowse.length, "The number of results does not match the number of NodesToBrowse." ) )
    {
        // check each result
        for( var i = 0; i < response.Results.length; i++ )
        {
            AssertStatusCodeIsOneOf( expectedOperationResultsArray[i], response.Results[i].StatusCode, "Response.Results[" + i + "].StatusCode" );
        }
    }
    // check diagnostic infos
    checkDiagnosticInfosError( request.RequestHeader, expectedOperationResultsArray, response.DiagnosticInfos, response.ResponseHeader.StringTable );
}