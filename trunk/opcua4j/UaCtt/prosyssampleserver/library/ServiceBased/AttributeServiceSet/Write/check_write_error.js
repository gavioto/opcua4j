/*
    Description:
        Validates the Write() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_error.js" );
include( "./library/ClassBased/UaDiagnosticInfo/check_diagnosticInfos_error.js" );

// the service is expected to succeed
// one, some or all operations are expected to fail

// This function checks if the server returned the expected error codes
// Request is of Type UaWriteRequest
// Response is of Type UaWriteResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/Objects/expectedResults.js)
function checkWriteError( Request, Response, ExpectedOperationResultsArray, ValidateValues, NodeSettings, checkNotSupported )
{
    var success = true;
    // check in parameters
    if( arguments.length < 4 )
    {
        addError( "function checkWriteError(Request, Response, ExpectedOperationResultsArray, ValidateValues): Number of arguments must be 4" );
        return( false );
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length !== Request.NodesToWrite.length )
    {
        addError( "function checkWriteError(): ExpectedOperationResultsArray[] must have the same size as Request.NodesToWrite[]" );
        return( false );
    }
    var useSettings = false;
    if( NodeSettings !== undefined && NodeSettings !== null )
    {
        if(  NodeSettings.length == Request.NodesToWrite.length )
        {
            useSettings = true;
        }
    }
    if( checkNotSupported !== undefined && checkNotSupported !== null )
    {
        print( "Checking for 'Bad_NotSupported' return codes..." );
    }
    // check response header
    success = checkResponseHeaderError( Request.RequestHeader, Response.ResponseHeader, ExpectedOperationResultsArray );
    // check results        
    // check number of results
    if( Response.Results.length !== Request.NodesToWrite.length )
    {
        addError( "The number of results does not match the number of NodesToWrite." );
        addError( "NodesToWrite.length=" + Request.NodesToWrite.length + " Results.length=" + Response.Results.length );
        success = false;
    }
    else
    {
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            var errorMessage = "Response.Results[" + i + "].StatusCode = '" + Response.Results[i] + "'";
            var bMatch = false;
            var j;
            // check if result matches any of the expected status code
            for( j=0; j<ExpectedOperationResultsArray[i].ExpectedResults.length; j++ )
            {
                // check if the write result is NOT SUPPORTED
                if( checkNotSupported !== undefined && checkNotSupported !== null )
                {
                    if( Response.Results[i].StatusCode === StatusCode.BadWriteNotSupported
                        || Response.Results[i].StatusCode === StatusCode.BadNotSupported )
                    {
                        if( useSettings )
                        {
                            errorMessage += " (Node Setting: '" + NodeSettings[i] + "')";
                        }
                        errorMessage += " Server indicated a lack of support for the requested write operation using Bad_WriteNotSupported.";
                        addNotSupported( errorMessage );
                        // fake the routine into saying we found what we're looking for
                        bMatch = true;
                        break;
                    }
                }
                if( Response.Results[i].StatusCode === ExpectedOperationResultsArray[i].ExpectedResults[j].StatusCode )
                {
                    if( useSettings )
                    {
                        if( NodeSettings[i] !== undefined && NodeSettings[i] !== null && NodeSettings[i] !== "" )
                        {
                            errorMessage += " (Node Setting: '" + NodeSettings[i] + "')";
                        }
                    }
                    errorMessage += " as expected.";
                    addLog( errorMessage, Response.Results[i] );
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch )
            {
                // check if result matches any of the accepted status codes
                for( j=0; j<ExpectedOperationResultsArray[i].AcceptedResults.length; j++ )
                {
                    if( Response.Results[i].StatusCode === ExpectedOperationResultsArray[i].AcceptedResults[j].StatusCode )
                    {
                        bMatch = true;
                        break;
                    }
                }
                errorMessage += "; but StatusCode '" + ExpectedOperationResultsArray[i].ExpectedResults[0] + "' was expected";
                if( useSettings )
                {
                    errorMessage += " (Node Setting: '" + NodeSettings[i] + "')";
                }
                if( bMatch )
                {
                    addWarning( errorMessage, Response.Results[i] );
                }
                else
                {
                    errorMessage += "\nStatusCode expectations for this call were...\n";
                    for( var e=0; e<ExpectedOperationResultsArray.length; e++ )
                    {
                        errorMessage += ExpectedOperationResultsArray[e].toString();
                    }
                    addError( errorMessage, Response.Results[i] );
                    success = false;
                }
            }//if !match...
        }//for i...
        // read the written values and check if the value is the same
        if( ValidateValues )
        {
            compareWritesToRead( Request, Response, NodeSettings );
        }
    }
    // check diagnostic infos
    checkDiagnosticInfosError( Request.RequestHeader, ExpectedOperationResultsArray, Response.DiagnosticInfos, Response.ResponseHeader.StringTable );
    return( success );
}