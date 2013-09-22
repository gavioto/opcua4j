/*
    Description:
        Validates the TranslateBrowsePathsToNodeIds() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_error.js")
include("./library/ClassBased/UaDiagnosticInfo/check_diagnosticInfos_error.js")

// the service is expected to succeed
// one, some or all operations are expected to fail

// This function checks if the server returned the expected error codes
// Request is of Type UaTranslateBrowsePathsToNodeIdsRequest
// Response is of Type UaTranslateBrowsePathsToNodeIdsResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/Objects/expectedResults.js)
function checkTranslateBrowsePathsToNodeIdsError( Request, Response, ExpectedOperationResultsArray )
{
    // check in parameters
    if( arguments.length !== 3 )
    {
        addError( "function checkTranslateBrowsePathsToNodeIdsError(): Number of arguments must be 3" );
        return( false );
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length !== Request.BrowsePaths.length )
    {
        addError( "checkTranslateBrowsePathsToNodeIdsError: ExpectedOperationResultsArray[] must have the same size as Request.BrowsePaths[]" );
        return( false );
    }
    var success = true;
    // check response header
    checkResponseHeaderError( Request.RequestHeader, Response.ResponseHeader, ExpectedOperationResultsArray );
    // check results        
    // check number of results
    if( Response.Results.length !== Request.BrowsePaths.length )
    {
        addError( "The number of results does not match the number of BrowsePaths." );
        addError( "BrowsePaths.length=" + Request.BrowsePaths.length + "; Results.length=" + Response.Results.length );
        return( false );
    }
    else
    {        
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            var browsePathResult = Response.Results[i];
            var bMatch = false;
            // check if result matches any of the expected status code
            for( var j=0; j < ExpectedOperationResultsArray[i].ExpectedResults.length; j++ )
            {
                if( browsePathResult.StatusCode.StatusCode == ExpectedOperationResultsArray[i].ExpectedResults[j].StatusCode )
                {
                    addLog( "Response.Results[" + i + "].StatusCode = " + browsePathResult.StatusCode, browsePathResult.StatusCode );
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch )
            {
                // check if result matches any of the accepted status codes
                for( var j=0; j<ExpectedOperationResultsArray[i].AcceptedResults.length; j++ )
                {
                    if( browsePathResult.StatusCode.StatusCode == ExpectedOperationResultsArray[i].AcceptedResults[j].StatusCode )
                    {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch )
                {
                    addWarning( "Response.Results[" + i + "].StatusCode = " + browsePathResult.StatusCode + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", browsePathResult.StatusCode );
                }
                else
                {
                    addError( "Response.Results[" + i + "].StatusCode = " + browsePathResult.StatusCode + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", browsePathResult.StatusCode );
                    success = false;
                }
            }
        }
    }    
    // check diagnostic infos
    checkDiagnosticInfosError( Request.RequestHeader, ExpectedOperationResultsArray, Response.DiagnosticInfos, Response.ResponseHeader.StringTable );
    return( success );
}