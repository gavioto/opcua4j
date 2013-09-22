/*
    Description:
        Validates the ActivateSession() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP : REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_error.js")
include("./library/ClassBased/UaDiagnosticInfo/check_diagnosticInfos_error.js")
include( "./library/ServiceBased/SessionServiceSet/CreateSession/isChannelSecure.js" );
include( "./library/Base/nonces.js" );

// the service is expected to succeed
// one, some or all operations are expected to fail

// This function checks if the server returned the expected error codes
// Session is the session used to invoke the service
// Request is of Type UaActivateSessionRequest
// Response is of Type UaActivateSessionResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/Objects/expectedResults.js)
function checkActivateSessionError( Session, Request, Response, ExpectedOperationResultsArray )
{
    // check in parameters
    if( arguments.length !== 4 )
    {
        addError( "function checkActivateSessionError(): Number of arguments must be 4" );
        return( false );
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length !== Request.ClientSoftwareCertificates.length )
    {
        addError( "checkActivateSessionError(): ExpectedOperationResultsArray[] must have the same size as Request.ClientSoftwareCertificates[]" );
        return( false );
    }
    // check response header
    var result = checkResponseHeaderError( Request.RequestHeader, Response.ResponseHeader, ExpectedOperationResultsArray );
    // check results        
    // check number of results
    if( Response.Results.length !== Request.ClientSoftwareCertificates.length )
    {
        addError( "checkActivateSessionError(): The number of results does not match the number of ClientSoftwareCertificates." );
        addError( "checkActivateSessionError(): ClientSoftwareCertificates.length=" + Request.ClientSoftwareCertificates.length + " Results.length=" + Response.Results.length );
        result = false;
    }
    else
    {        
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            var bMatch = false;
            // check if result matches any of the expected status code
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
    
    // Check the server nonce.
    var nonceRequired = isChannelSecure( Session.Channel );
    result = checkServerNonceLength( nonceRequired, Response.ServerNonce );
    
    // Check if nonce is unique.
    result = saveServerNonce( Response.ServerNonce );    
    
    return( result );
}