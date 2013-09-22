/*
    Description:
        Validates the SetTriggering() ERROR response by analyzing the parameters.

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
function checkSetTriggeringError( Request, Response, ExpectedOperationResultsAdd, ExpectedOperationResultsRemove )
{
    // check in parameters
    if( arguments.length !== 4 )
    {
        addError( "function checkSetTriggeringError(Request, Response, ExpectedOperationResultsAdd, ExpectedOperationResultsRemove): Number of arguments must be 4" );
        return( false );
    }
    // check service result
    if( Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadNotImplemented 
        || Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadServiceUnsupported )
    {
        addNotSupported( "SetTriggering" );
        addError( "SetTriggering is a required Service. Verify if this Conformance Unit should be selected for testing." );
        return( false );
    }
    // ExpectedOperationResultsAdd and ExpectedOperationResultsRemove needs to have the correct size
    if( Request.LinksToAdd.length > 0 )
    {
        if( ExpectedOperationResultsAdd.length !== Request.LinksToAdd.length )
        {
            addError( "function checkSetTriggeringError(): ExpectedOperationResultsAdd[] must have the same size as Request.LinksToAdd[]" );
            return( false );
        }
    }
    if( Request.LinksToRemove.length > 0 )
    {
        if( ExpectedOperationResultsRemove.length != Request.LinksToRemove.length )
        {
            addError( "function checkSetTriggeringError(): ExpectedOperationResultsRemove[] must have the same size as Request.LinksToRemove[]" );
            return( false );
        }
    }
    // check response header for "add"
    if( ExpectedOperationResultsAdd !== undefined && ExpectedOperationResultsAdd !== null )
    {
        if( !checkResponseHeaderError( Request.RequestHeader, Response.ResponseHeader, ExpectedOperationResultsAdd ) )
        {
            return( false );
        }
    }
    // check response header for "remove"
    if( ExpectedOperationResultsRemove !== undefined && ExpectedOperationResultsRemove !== null )
    {
        if( !checkResponseHeaderError( Request.RequestHeader, Response.ResponseHeader, ExpectedOperationResultsRemove ) )
        {
            return( false );
        }
    }
    var results = true;
    // check AddResults
    if( Response.AddResults.length !== Request.LinksToAdd.length )
    {
        addError( "The number of AddResults does not match the number of LinksToAdd." );
        addError( "LinksToAdd.length=" + Request.LinksToAdd.length + " AddResults.length=" + Response.AddResults.length );
        results = false;
    }
    else
    {
        // check each result
        for( var i=0; i<Response.AddResults.length; i++ )
        {
            // StatusCode
            var bMatch = false;
            // check if result matches any of the expected status codes
            for( var j = 0; j < ExpectedOperationResultsAdd[i].ExpectedResults.length; j++ )
            {
                if( Response.AddResults[i].StatusCode == ExpectedOperationResultsAdd[i].ExpectedResults[j].StatusCode )
                {
                    addLog( "Response.AddResults[" + i + "] = " + Response.AddResults[i], Response.AddResults[i] );
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch )
            {
                // check if result matches any of the accepted status codes
                for( var j=0; j<ExpectedOperationResultsAdd[i].AcceptedResults.length; j++ )
                {
                    if( Response.AddResults[i].StatusCode == ExpectedOperationResultsAdd[i].AcceptedResults[j].StatusCode )
                    {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch )
                {
                    addWarning( "Response.AddResults[" + i + "] = " + Response.AddResults[i] + " but " + ExpectedOperationResultsAdd[i].ExpectedResults[0] + " was expected", Response.AddResults[i] );
                }
                else
                {
                    addError( "Response.AddResults[" + i + "] = " + Response.AddResults[i] + " but " + ExpectedOperationResultsAdd[i].ExpectedResults[0] + " was expected", Response.AddResults[i] );
                    results = false;
                }
            }
        }//for i...
        // check the ADD diagnositcinfo
        AssertEqual( 0, Response.AddDiagnosticInfos.length, "SetTriggeringResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
    }
    // check RemoveResults
    if( Response.RemoveResults.length !== Request.LinksToRemove.length )
    {
        addError( "The number of RemoveResults does not match the number of LinksToRemove." );
        addError( "LinksToRemove.length=" + Request.LinksToRemove.length + " RemoveResults.length=" + Response.RemoveResults.length );
        results = false;
    }
    else
    {   
        // check each result
        for( var i=0; i<Response.RemoveResults.length; i++ )
        {
            var bMatch = false;
            // check if result matches any of the expected status codes
            for( var j=0; j<ExpectedOperationResultsRemove[i].ExpectedResults.length; j++ )
            {
                if( Response.RemoveResults[i].StatusCode == ExpectedOperationResultsRemove[i].ExpectedResults[j].StatusCode )
                {
                    addLog( "Response.RemoveResults[" + i + "] = " + Response.RemoveResults[i], Response.RemoveResults[i] );
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch )
            {
                // check if result matches any of the accepted status codes
                for( var j=0; j<ExpectedOperationResultsRemove[i].AcceptedResults.length; j++ )
                {
                    if( Response.RemoveResults[i].StatusCode == ExpectedOperationResultsRemove[i].AcceptedResults[j].StatusCode )
                    {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch )
                {
                    addWarning( "Response.RemoveResults[" + i + "] = " + Response.RemoveResults[i] + " but " + ExpectedOperationResultsRemove[i].ExpectedResults[0] + " was expected", Response.RemoveResults[i] );
                }
                else
                {
                    addError( "Response.RemoveResults[" + i + "] = " + Response.RemoveResults[i] + " but " + ExpectedOperationResultsRemove[i].ExpectedResults[0] + " was expected", Response.RemoveResults[i] );
                    results = false;
                }
            }// for j...
            // check the REMOVE diagnositcinfo
            AssertEqual( 0, Response.RemoveDiagnosticInfos.length, "SetTriggeringResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        }
    }
    // check diagnostic infos
    checkDiagnosticInfosError( Request.RequestHeader, ExpectedOperationResultsAdd, Response.AddDiagnosticInfos, Response.ResponseHeader.StringTable );
    checkDiagnosticInfosError( Request.RequestHeader, ExpectedOperationResultsRemove, Response.RemoveDiagnosticInfos, Response.ResponseHeader.StringTable );
    return( results );
}