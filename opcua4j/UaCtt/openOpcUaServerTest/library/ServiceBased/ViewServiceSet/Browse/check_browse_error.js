/*
    Description:
        Validates the Browse() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_error.js")
include("./library/ClassBased/UaDiagnosticInfo/check_diagnosticInfos_error.js")

// the service is expected to succeed
// one, some or all operations are expected to fail

// This function checks if the server returned the expected error codes
// Request is of Type UaBrowseRequest
// Response is of Type UaBrowseResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/Objects/expectedResults.js)
function checkBrowseError( Request, Response, ExpectedOperationResultsArray )
{
    // check in parameters
    if( arguments.length !== 3 )
    {
        addError( "function checkBrowseError(): Number of arguments must be 3" );
        return( false );
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length !== Request.NodesToBrowse.length )
    {
        addError( "checkBrowseError: ExpectedOperationResultsArray[] must have the same size as Request.NodesToBrowse[]" );
        return( false );
    }
    // check response header
    checkResponseHeaderError( Request.RequestHeader, Response.ResponseHeader, ExpectedOperationResultsArray );
    // check results        
    // check number of results
    if( Response.Results.length !== Request.NodesToBrowse.length )
    {
        addError( "The number of results does not match the number of NodesToBrowse." );
        addError( "NodesToBrowse.length=" + Request.NodesToBrowse.length + "; Results.length=" + Response.Results.length );
    }
    else
    {        
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            var browseResult = Response.Results[i];
            var bMatch = false;
            // check if result matches any of the expected status code
            for( var j=0; j<ExpectedOperationResultsArray[i].ExpectedResults.length; j++ )
            {
                if( browseResult.StatusCode.StatusCode == ExpectedOperationResultsArray[i].ExpectedResults[j].StatusCode )
                {
                    addLog( "Response.Results[" + i + "].StatusCode = " + browseResult.StatusCode + " as expected.", browseResult.StatusCode );
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch )
            {
                // check if result matches any of the accepted status codes
                for( var j=0; j<ExpectedOperationResultsArray[i].AcceptedResults.length; j++ )
                {
                    if( browseResult.StatusCode.StatusCode == ExpectedOperationResultsArray[i].AcceptedResults[j].StatusCode )
                    {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch )
                {
                    addWarning( "Response.Results[" + i + "].StatusCode = " + browseResult.StatusCode + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", browseResult.StatusCode );
                }
                else
                {
                    addError( "Response.Results[" + i + "].StatusCode = " + browseResult.StatusCode + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", browseResult.StatusCode );
                }
            }
            // max references per node
            if( ( Request.RequestedMaxReferencesPerNode != 0 ) && ( browseResult.References.length > Request.RequestedMaxReferencesPerNode ) )
            {
                addError( "The server returned more references than requested." );
                addError( "Results[" + i + "].References.length = " + browseResult.References.length + " but Request.RequestedMaxReferencesPerNode = " + Request.RequestedMaxReferencesPerNode );
                bSucceeded = false;
                continue;
            }
        }
    }    
    // check diagnostic infos
    checkDiagnosticInfosError( Request.RequestHeader, ExpectedOperationResultsArray, Response.DiagnosticInfos, Response.ResponseHeader.StringTable );
    return( true );
}