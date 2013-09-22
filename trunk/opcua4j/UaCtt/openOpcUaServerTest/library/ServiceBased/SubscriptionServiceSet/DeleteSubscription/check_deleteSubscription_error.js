/*
    Description:
        Validates the DeleteSubscription() response partially succeded by analyzing
        the parameters.

    Revision History:
        25-Nov-2009 NP : REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_error.js")
include("./library/ClassBased/UaDiagnosticInfo/check_diagnosticInfos_error.js")

// the service is expected to succeed
// one, some or all operations are expected to fail

// This function checks if the server returned the expected error codes
// Request is of Type UaDeleteSubscriptionsRequest
// Response is of Type UaDeleteSubscriptionsResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/objects.js)
function checkDeleteSubscriptionsError( Request, Response, ExpectedOperationResultsArray )
{
    var result = true;
    // check in parameters
    if( arguments.length !== 3 )
    {
        addError( "function checkDeleteSubscriptionsError(Request, Response, ExpectedOperationResultsArray): Number of arguments must be 3" );
        return( false );
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length !== Request.SubscriptionIds.length )
    {
        addError( "function checkDeleteSubscriptionsError(): ExpectedOperationResultsArray[] must have the same size as Request.SubscriptionIds[]" );
        return( false );
    }
    // check response header
    result = checkResponseHeaderError( Request.RequestHeader, Response.ResponseHeader, ExpectedOperationResultsArray );
    // check results        
    // check number of results
    if( Response.Results.length !== Request.SubscriptionIds.length )
    {
        addError( "The number of results does not match the number of SubscriptionIds." );
        addError( "SubscriptionIds.length=" + Request.SubscriptionIds.length + " Results.length=" + Response.Results.length );
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
    return( result );
}