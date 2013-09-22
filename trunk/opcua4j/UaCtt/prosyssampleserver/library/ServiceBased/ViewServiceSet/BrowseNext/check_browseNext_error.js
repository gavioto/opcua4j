/*
    Description:
        Validates the BrowseNext() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

/*global include, addError, checkResponseHeaderError, AssertStatusCodeIsOneOf,
  checkDiagnosticInfosError
*/

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_error.js" );
include( "./library/ClassBased/UaDiagnosticInfo/check_diagnosticInfos_error.js" );

// the service is expected to succeed
// one, some or all operations are expected to fail

// This function checks if the server returned the expected error codes
// Request is of Type UaBrowseNextRequest
// Response is of Type UaBrowseNextResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/Objects/expectedResults.js)
function checkBrowseNextError( request, response, expectedOperationResultsArray )
{
    // check in parameters
    if( arguments.length !== checkBrowseNextError.length )
    {
        addError( "function checkBrowseNextError(): Number of arguments must be " + checkBrowseNextError.length );
        return( false );
    }
    
    // ExpectedOperationResultsArray needs to have the correct size
    if( expectedOperationResultsArray.length !== request.ContinuationPoints.length )
    {
        addError( "checkBrowseNextError: ExpectedOperationResultsArray[] must have the same size as Request.ContinuationPoints[]" );
        return( false );
    }  
    // check response header
    checkResponseHeaderError( request.RequestHeader, response.ResponseHeader, expectedOperationResultsArray );
    // check results        
    // check number of results
    if( response.Results.length !== request.ContinuationPoints.length )
    {
        addError( "The number of results does not match the number of ContinuationPoints." );
        addError( "ContinuationPoints.length=" + request.ContinuationPoints.length + "; Results.length=" + response.Results.length );
    }
    else
    {        
        // check each result
        for( var i=0; i<response.Results.length; i++ )
        {
            var browseResult = response.Results[i];
            // check if result matches any of the expected status code
            AssertStatusCodeIsOneOf( expectedOperationResultsArray[i], browseResult.StatusCode, "Response.Results[" + i + "].StatusCode" );
            // check for ReleaseContinuationPoints
            if( request.ReleaseContinuationPoints === true )
            {
                if( !browseResult.ContinuationPoint.isEmpty() )
                {
                    addError( "Request.ReleaseContinuationPoints = true but Results[" + i + "].ContinuationPoint is not empty. " );
                    continue;
                }
                if( browseResult.References.length !== 0 )
                {
                    addError( "Request.ReleaseContinuationPoints = true but Results[" + i + "].References.length = " + browseResult.References.length );
                    continue;
                }
            }
        }
    }    
    // check diagnostic infos
    checkDiagnosticInfosError( request.RequestHeader, expectedOperationResultsArray, response.DiagnosticInfos, response.ResponseHeader.StringTable );
}