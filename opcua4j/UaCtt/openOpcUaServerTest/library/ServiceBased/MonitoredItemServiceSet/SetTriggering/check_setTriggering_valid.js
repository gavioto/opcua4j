/*
    Description:
        Validates the SetTriggering() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js")

// the service is expected to succeed
// all operations are expected to succeed
function checkSetTriggeringValidParameter( Request, Response )
{
    // check in parameters
    if ( arguments.length !== 2 )
    {
        addError( "function checkSetTriggeringValidParameter(Request, Response): Number of arguments must be 2!" );
        return( false );
    }
    else
    {
        // make sure the parameters contain something
        if( Request === undefined || Request === null || Response === undefined || Response === null )
        {
            addError( "function checkSetTriggeringValidParameter(Request, Response). These parameters were specified, but not correctly." );
            return( false );
        }
    }
    // not implemented?
    if( Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadNotImplemented 
        || Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadServiceUnsupported )
    {
        addNotSupported( "SetTriggering" );
        addError( "SetTriggering is a required Service. Verify if this Conformance Unit should be selected for testing." );
        return( false );
    }
    var result = true; // return code
    // as this is a valid parameter test we don't expect any diagnositcinfo
    if( Response.AddDiagnosticInfos.length !== 0 )
    {
        addError( "SetTriggeringResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        result = false;
    }
    if( Response.RemoveDiagnosticInfos.length !== 0 )
    {
        addError( "SetTriggeringResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        result = false;
    }
    // check response header
    if( !checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader ) )
    {
        result = false;
    }
    // check add results
    if( Response.AddResults.length !== Request.LinksToAdd.length )
    {
        addError( "The number of AddResults does not match the number of LinksToAdd." );
        addError( "LinksToAdd.length = " + Request.LinksToAdd.length + " Results.AddResults = " + Response.AddResults.length );
        result = false;
    }
    else
    {
        // check each result
        for( var i=0; i<Response.AddResults.length; i++ )
        {
            // status code
            if( Response.AddResults[i].isNotGood() )
            {
                addError( "AddResults[" + i + "] is not good: " + Response.AddResults[i], Response.AddResults[i] );
                result = false;
            }
        }
    }
    // check remove results 
    if( Response.RemoveResults.length !== Request.LinksToRemove.length )
    {
        addError( "The number of RemoveResults does not match the number of LinksToRemove." );
        addError( "LinksToRemove.length = " + Request.LinksToRemove.length + " Results.RemoveResults = " + Response.RemoveResults.length );
        result = false;
    }
    else
    {        
        // check each result
        for( var i=0; i<Response.RemoveResults.length; i++ )
        {
            // status code
            if( Response.RemoveResults[i].isNotGood() )
            {
                addError( "RemoveResults[" + i + "] is not good: " + Response.RemoveResults[i], Response.RemoveResults[i] );
                result = false;
            }
        }
    }
    // check diagnostic infos for add and remove
    // no error is expected so the DiagnosticInfos should be empty
    if( Response.AddDiagnosticInfos.length !== 0 )
    {
        addError( "AddDiagnosticInfos are not empty" );
        addError( "AddDiagnosticInfos: " + Response.AddDiagnosticInfos );
        result = false;
    }
    if( Response.RemoveDiagnosticInfos.length !== 0 )
    {
        addError( "RemoveDiagnosticInfos are not empty" );
        addError( "RemoveDiagnosticInfos: " + Response.RemoveDiagnosticInfos );
        result = false;
    }
    return( result );
}