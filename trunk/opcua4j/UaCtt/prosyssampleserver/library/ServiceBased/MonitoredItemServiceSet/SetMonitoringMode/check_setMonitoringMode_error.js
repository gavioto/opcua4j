/*
    Description:
        Validates the SetMonitoringMode() ERROR response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_error.js")
include("./library/ClassBased/UaDiagnosticInfo/check_diagnosticInfos_error.js")

// the service is expected to succeed
// one, some or all operations are expected to fail

// This function checks if the server returned the expected error codes
// Request is of Type UaModifyMonitoredItemsRequest
// Response is of Type UaModifyMonitoredItemsResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/objects.js)
function checkSetMonitoringModeError( Request, Response, ExpectedOperationResultsArray )
{
    var result = true;
    // check in parameters
    if( arguments.length !== 3 )
    {
        addError( "function checkSetMonitoringModeError(Request, Response, ExpectedOperationResultsArray): Number of arguments must be 3" );
        return false;
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length != Request.MonitoredItemIds.length )
    {
        addError( "function checkSetMonitoringModeError(): ExpectedOperationResultsArray[] must have the same size as Request.MonitoredItemIds[]. Expected: " + ExpectedOperationResultsArray.length + ", but received: " + Request.MonitoredItemIds.length );
        return false;
    }  
    // check response header
    checkResponseHeaderError( Request.RequestHeader, Response.ResponseHeader, ExpectedOperationResultsArray );
    // check results        
    // check number of results
    if( Response.Results.length !== Request.MonitoredItemIds.length )
    {
        addError( "The number of results does not match the number of MonitoredItemIds." );
        addError( "MonitoredItemIds.length=" + Request.MonitoredItemIds.length + " Results.length=" + Response.Results.length );
        result = false;
    }
    else
    {
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            // StatusCode
            var bMatch = false;
            // check if result matches any of the expected status codes
            for( var j=0; j<ExpectedOperationResultsArray[i].ExpectedResults.length; j++ )
            {
                if( Response.Results[i].StatusCode == ExpectedOperationResultsArray[i].ExpectedResults[j].StatusCode )
                {
                    addLog( "Response.Results[" + i + "] = " + Response.Results[i], Response.Results[i] );
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch )
            {
                // check if result matches any of the accepted status codes
                for( var j=0; j<ExpectedOperationResultsArray[i].AcceptedResults.length; j++ )
                {
                    if( Response.Results[i].StatusCode == ExpectedOperationResultsArray[i].AcceptedResults[j].StatusCode )
                    {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch )
                {
                    addWarning( "Response.Results[" + i + "] = " + Response.Results[i] + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", Response.Results[i] );
                }
                else
                {
                    addError( "Response.Results[" + i + "] = " + Response.Results[i] + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", Response.Results[i] );
                    result = false;
                }
            }
        }
    }
    // check diagnostic infos
    checkDiagnosticInfosError( Request.RequestHeader, ExpectedOperationResultsArray, Response.DiagnosticInfos, Response.ResponseHeader.StringTable );
    return result;
}