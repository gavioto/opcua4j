/*
    Description:
        Validates the ModifyMonitoredItems() ERROR response by analyzing the parameters.

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
function checkModifyMonitoredItemsError( Request, Response, ExpectedOperationResultsArray )
{
    // check in parameters
    if( arguments.length !== 3 )
    {
        addError( "function checkModifyMonitoredItemsError(Request, Response, ExpectedOperationResultsArray): Number of arguments must be 3" );
        return( false );
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length !== Request.ItemsToModify.length )
    {
        addError( "function checkModifyMonitoredItemsError(): ExpectedOperationResultsArray[] must have the same size as Request.ItemsToModify[]\n\tItems Modified: " + Request.ItemsToModify.length + ", we Expected " + ExpectedOperationResultsArray.length + " errors." );
        return( false );
    }  
    var success = true;
    // check response header
    if( !checkResponseHeaderError( Request.RequestHeader, Response.ResponseHeader, ExpectedOperationResultsArray ) )
    {
        success = false;
    }
    // check results        
    // check number of results
    if( Response.Results.length !== Request.ItemsToModify.length )
    {
        addError( "The number of results does not match the number of ItemsToModify." );
        addError( "ItemsToModify.length=" + Request.ItemsToModify.length + " Results.length=" + Response.Results.length );
        success = false;
    }
    else
    {   
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            // FilterResults
            // RevisedQueueSize
            // RevisedSamplingInterval
            // StatusCode
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
                    if( Response.Results[i].StatusCode.StatusCode == ExpectedOperationResultsArray[i].AcceptedResults[j].StatusCode )
                    {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch )
                {
                    addWarning( "Response.Results[" + i + "].StatusCode = " + Response.Results[i].StatusCode + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", Response.Results[i].StatusCode );
                }
                else
                {
                    addError( "Response.Results[" + i + "].StatusCode = " + Response.Results[i].StatusCode + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", Response.Results[i].StatusCode );
                    success = false;
                }
            }
        }
    }
    // check diagnostic infos
    if( !checkDiagnosticInfosError( Request.RequestHeader, ExpectedOperationResultsArray, Response.DiagnosticInfos, Response.ResponseHeader.StringTable ) )
    {
        success = false;
    }
    return( success );
}