/*
    Description:
        Validates the CreateMonitoredItems() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_error.js")
include("./library/ClassBased/UaDiagnosticInfo/check_diagnosticInfos_error.js")

// the service is expected to succeed
// one, some or all operations are expected to fail

// This function checks if the server returned the expected error codes
// Request is of Type UaCreateMonitoredItemsRequest
// Response is of Type UaCreateMonitoredItemsResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/Objects/expectedResults.js)
function checkCreateMonitoredItemsError( Request, Response, ExpectedOperationResultsArray )
{
    // check in parameters
    if( arguments.length !== 3 )
    {
        addError( "function checkCreateMonitoredItemsError(Request, Response, ExpectedOperationResultsArray): Number of arguments must be 3" );
        return( false );
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length !== Request.ItemsToCreate.length )
    {
        addError( "function checkCreateMonitoredItemsError(): ExpectedOperationResultsArray[] must have the same size as Request.ItemsToCreate[]. Expected length: " + Request.ItemsToCreate.length + "; Received length: " + ExpectedOperationResultsArray.length );
        return( false );
    }
    // check response header
    checkResponseHeaderError( Request.RequestHeader, Response.ResponseHeader, ExpectedOperationResultsArray );
    // check results        
    // check number of results
    var success = true;
    if( Response.Results.length !== Request.ItemsToCreate.length )
    {
        addError( "The number of results does not match the number of ItemsToCreate. ItemsToCreate.length=" + Request.ItemsToCreate.length + " Results.length=" + Response.Results.length );
        return( false );
    }
    else
    {
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            // StatusCode
            // RevisedSamplingInterval
            // RevisedQueueSize
            // MonitoredItemId
            // FilterResult
            var bMatch = false;
            // check if result matches any of the expected status codes
            for( var j=0; j<ExpectedOperationResultsArray[i].ExpectedResults.length; j++ )
            {
                if( Response.Results[i].StatusCode.StatusCode == ExpectedOperationResultsArray[i].ExpectedResults[j].StatusCode )
                {
                    addLog( "Response.Results[" + i + "].StatusCode = " + Response.Results[i].StatusCode, Response.Results[i].StatusCode );
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch )
            {
                // check if result matches any of the accepted status codes
                for( var j=0; j<ExpectedOperationResultsArray[i].AcceptedResults.length; j++ )
                {
                    if( Response.Results[i].StatusCode.StatusCode == ExpectedOperationResultsArray[i].AcceptedResults[j].StatusCode );
                    {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch )
                {
                    addWarning( "Response.Results[" + i + "].StatusCode = " + Response.Results[i].StatusCode + " but '" + ExpectedOperationResultsArray[i].ExpectedResults[0] + "' was expected", Response.Results[i].StatusCode );
                }
                else
                {
                    addError( "Response.Results[" + i + "].StatusCode = " + Response.Results[i].StatusCode + " but '" + ExpectedOperationResultsArray[i].ExpectedResults[0] + "' was expected", Response.Results[i].StatusCode );
                    success = false;
                }
            }            
        }
    }
    // check diagnostic infos
    checkDiagnosticInfosError( Request.RequestHeader, ExpectedOperationResultsArray, Response.DiagnosticInfos, Response.ResponseHeader.StringTable );
    return( success );
}