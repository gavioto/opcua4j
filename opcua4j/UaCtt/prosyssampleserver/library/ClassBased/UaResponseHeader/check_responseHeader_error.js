/*global include, UaDateTime, addError, addLog, diagnosticInfoIsEmpty, validateTimestamp,
  addWarning
*/

include( "./library/ClassBased/UaDiagnosticInfo/diagnositcInfoIsEmpty.js" );

// check request handle
// check service result
// check service diagnostics
// check timestamp
// check string table
function checkResponseHeaderError( RequestHeader, ResponseHeader, ExpectedOperationResultsArray )
{
    var bSucceeded = true;

    // get current time to validate the timestamp
    var currentClientTime = UaDateTime.utcNow();

    // request handle
    if( ResponseHeader.RequestHandle !== RequestHeader.RequestHandle )
    {
        addError( "ResponseHeader.RequestHandle does not match expected RequestHandle" );
        addError( "Expected: " + RequestHeader.RequestHandle + " Received: " + ResponseHeader.RequestHandle );
        bSucceeded = false;
    }

    // service result
    if( ResponseHeader.ServiceResult.isGood() )
    {
        addLog( "ServiceResult is good.", ResponseHeader.ServiceResult );
    }
    else
    {
        if( ResponseHeader.ServiceResult.StatusCode === StatusCode.BadNotImplemented ||
            ResponseHeader.ServiceResult.StatusCode === StatusCode.BadServiceUnsupported )
        {
            addNotSupported( "Server does not implement the requested Service call." );
        }
        else
        {
            addError( "ServiceResult is " + ResponseHeader.ServiceResult + " but is expected to be good", ResponseHeader.ServiceResult );
        }
        bSucceeded = false;
    }

    // timestamp
    validateTimestamp( ResponseHeader.Timestamp, currentClientTime, 1000 );

    // string table only should have entries if diagnostics were requested and if an error occured
    //var serviceLevelMask = 0x001F
    var operationLevelMask = 0x03E0;
    //var bServiceLevelRequested = false
    var bOperationLevelRequested = false;
    if( ( RequestHeader.ReturnDiagnostics & operationLevelMask ) !== 0 )
    {
        bOperationLevelRequested = true;
    }

    // count number of expected errors
    var numOperationLevelErrors = 0;
    for( var i = 0; i < ExpectedOperationResultsArray.length; i++ )
    {
        if( ExpectedOperationResultsArray[i].ExpectedResults !== null && ExpectedOperationResultsArray[i].ExpectedResults.length !== 0 )
        {
            if( ExpectedOperationResultsArray[i].ExpectedResults[0].isNotGood() )
            {
                numOperationLevelErrors++;
            }
        }
    }

    var diagnosticsAreEmpty = diagnosticInfoIsEmpty( ResponseHeader.ServiceDiagnostics, true );

    // string table should have some entries, but ONLY if Diagnostics are supported
    if( ( numOperationLevelErrors > 0 && bOperationLevelRequested ) || !diagnosticsAreEmpty )
    {
        if( ResponseHeader.StringTable.length === 0 )
        {
            _warning.store( "StringTable is empty although diagnostics were requested. This is not an error, but supporting Diagnostics are highly recommended." );
        }
    }
    // string table should be empty
    else
    {
        if( ResponseHeader.StringTable.length !== 0 )
        {
            addError( "StringTable should be empty but is not!\nContents: " + ResponseHeader.StringTable );
            bSucceeded = false;
        }
    }

    // service diagnostic
    // we don't expect any diagnostics
    if( diagnosticsAreEmpty )
    {
        print( "ResponseHeader.ServiceDiagnostics is empty" );
    }
    else
    {
        addError( "ResponseHeader.ServiceDiagnostics is not empty" );
    }

    return bSucceeded;
}