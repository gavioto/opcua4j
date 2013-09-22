/*
    Description:
        Validates the Read() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_error.js")
include("./library/ClassBased/UaDiagnosticInfo/check_diagnosticInfos_error.js")

// the service is expected to succeed
// one, some or all operations are expected to fail

// This function checks if the server returned the expected error codes
// Request is of Type UaReadRequest
// Response is of Type UaReadResponse
// ExpectedOperationResultsArray is an array ExpectedAndAcceptedResult (defined in Base/Objects/expectedResults.js)
function checkReadError( Request, Response, ExpectedOperationResultsArray, NodeSettings )
{
    var success = true;
    // check in parameters
    if( arguments.length < 3 )
    {
        addError( "function checkReadError(): Number of arguments must be 3" );
        return( false );
    }
    // ExpectedOperationResultsArray needs to have the correct size
    if( ExpectedOperationResultsArray.length !== Request.NodesToRead.length )
    {
        addError( "checkReadError: ExpectedOperationResultsArray[] (received: " + ExpectedOperationResultsArray.length +
            ") must have the same size as Request.NodesToRead[] (received: " + Request.NodesToRead.length + ")" );
        return( false );
    }  
    // check response header
    checkResponseHeaderError( Request.RequestHeader, Response.ResponseHeader, ExpectedOperationResultsArray );
    // check results        
    // check number of results
    if( Response.Results.length !== Request.NodesToRead.length )
    {
        addError( "The number of results does not match the number of NodesToRead." );
        addError( "NodeToRead.length=" + Request.NodesToRead.length + " Results.length=" + Response.Results.length );
        success = false;
    }
    else
    {        
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            var dataValue = Response.Results[i];
            var bMatch = false;
            // check if result matches any of the expected status code
            for( var j=0; j<ExpectedOperationResultsArray[i].ExpectedResults.length; j++ )
            {
                if( dataValue.StatusCode.StatusCode == ExpectedOperationResultsArray[i].ExpectedResults[j].StatusCode )
                {
                    addLog( "Response.Results[" + i + "].StatusCode = " + dataValue.StatusCode, dataValue.StatusCode );
                    bMatch = true;
                    break;
                }
            }
            if( !bMatch )
            {
                // check if result matches any of the accepted status codes
                for( var j=0; j<ExpectedOperationResultsArray[i].AcceptedResults.length; j++ )
                {
                    if( dataValue.StatusCode.StatusCode == ExpectedOperationResultsArray[i].AcceptedResults[j].StatusCode )
                    {
                        bMatch = true;
                        break;
                    }
                }
                if( bMatch )
                {
                    addWarning( "Response.Results[" + i + "].StatusCode = " + dataValue.StatusCode + " but " + ExpectedOperationResultsArray[i].ExpectedResults[0] + " was expected", dataValue.StatusCode );
                }
                else
                {
                    var errMsg = "Response.Results[" + i + "].StatusCode = " + dataValue.StatusCode + " but ";
                    for( var e=0; e<ExpectedOperationResultsArray[i].ExpectedResults.length; e++ )
                    {
                        errMsg += ExpectedOperationResultsArray[i].ExpectedResults[e];
                        if( e < (ExpectedOperationResultsArray[i].ExpectedResults.length-1) )errMsg += " or ";
                    }
                    addError(  errMsg + " was expected.", dataValue.StatusCode );
                    success = false;
                }
            }
            // check type of attribute - only the attribute value has a SourceTimestamp
            if( Request.NodesToRead[i].AttributeId == Attribute.Value )
            {
                if( Request.TimestampsToReturn == TimestampsToReturn.Server || Request.TimestampsToReturn == TimestampsToReturn.Neither )
                {
                    // no SourceTimestamp expected
                    if( !dataValue.SourceTimestamp.isNull() )
                    {
                        addWarning( "SourceTimestamp is set for Result[" + i + "] but wasn't requested" );
                    }
                }   
            }
            // no SourceTimestamp expected
            else
            {
                if( !dataValue.SourceTimestamp.isNull() )
                {
                    addError( "SourceTimestamp is set for Result[" + i + "] but SourceTimestamps should only be returned for a Value Attribute." );
                    success = false;
                }
            }
            // ServerTimestamp
            if( Request.TimestampsToReturn == TimestampsToReturn.Source || Request.TimestampsToReturn == TimestampsToReturn.Neither )
            {                    
                if( !dataValue.ServerTimestamp.isNull() )
                {
                    addWarning( "ServerTimestamp is set for Response.Result[" + i + "] but wasn't requested. Timestamp = " + dataValue.ServerTimestamp );
                }
            }
        }
    }    
    // check diagnostic infos
    checkDiagnosticInfosError( Request.RequestHeader, ExpectedOperationResultsArray, Response.DiagnosticInfos, Response.ResponseHeader.StringTable );
    return( success );
}