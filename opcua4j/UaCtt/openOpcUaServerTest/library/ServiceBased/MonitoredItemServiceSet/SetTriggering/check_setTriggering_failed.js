/*
    Description:
        Validates the SetTriggering() FAILED response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_failed.js")
// the service is expected to fail

// This function checks if the server returned the expected error code
// Request is of Type UaSetTriggeringRequest
// Response is of Type UaSetTriggeringReponse
// ExpectedServiceResult is object of type ExpectedAndAcceptedResults (defined in Base/Objects/expectedResults.js)
function checkSetTriggeringFailed( Request, Response, ExpectedServiceResults )
{
    // check in parameters
    if( arguments.length !== 3 )
    {
        addError( "function checkSetTriggeringFailed(Request, Response, ExpectedServiceResults): Number of arguments must be 3" );
        return( false );
    }
    // check response header
    if( Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadNotImplemented 
        || Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadServiceUnsupported )
    {
        addNotSupported( "SetTriggering" );
        addError( "SetTriggering is a required Service. Verify if this Conformance Unit should be selected for testing." );
        return( false );
    }
    else
    {
        var result = checkResponseHeaderFailed( Request.RequestHeader, Response.ResponseHeader, ExpectedServiceResults );
        return( result );
    }
}