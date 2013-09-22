include("./library/ClassBased/UaDiagnosticInfo/diagnositcInfoIsEmpty.js")
include( "./library/Base/check_timestamp.js" );

// check request handle
// check service result
// check service diagnostics
// check timestamp
// check string table
function checkResponseHeaderFailed( RequestHeader, ResponseHeader, ExpectedServiceResult )
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

    // check if service results matches any of the expected service results
    var bMatch = false;
    for( var i=0; i<ExpectedServiceResult.ExpectedResults.length; i++ )
    {
        if( ResponseHeader.ServiceResult.StatusCode == ExpectedServiceResult.ExpectedResults[i].StatusCode )
        {
            addLog( "Received expected ServiceResult '" + ExpectedServiceResult.ExpectedResults[i] + "'." );
            bMatch = true;
            break;
        }
    }

    // check for accepted  service result
    if( !bMatch )
    {
        
        for( var i = 0; i < ExpectedServiceResult.AcceptedResults.length; i++ )
        {
            if( ResponseHeader.ServiceResult.StatusCode == ExpectedServiceResult.AcceptedResults[i].StatusCode )
            {
                bMatch = true;
                break;
            }
        }

        if( bMatch )
        {
            addWarning( "ResponseHeader.ServiceResult = " + ResponseHeader.ServiceResult + " but " +ExpectedServiceResult.ExpectedResults[0] + " was expected", ResponseHeader.ServiceResult );
        }
        else
        {
            addError( "ResponseHeader.ServiceResult = " + ResponseHeader.ServiceResult + " but " +ExpectedServiceResult.ExpectedResults[0] + " was expected", ResponseHeader.ServiceResult );
        }
    }

    // timestamp
    validateTimestamp( ResponseHeader.Timestamp, currentClientTime, 1000 );


    // check service diagnostic and string table
    // if diagnositc infos were requested on service level we expect to see something    
    // string table only should have entries if diagnostics were requested and if an error occured
    var serviceLevelMask = 0x001F;
    var bServiceLevelRequested = false;

    // string table should have some entries
    if( ( RequestHeader.ReturnDiagnostics & serviceLevelMask ) !== 0 )
    {
        if( diagnosticInfoIsEmpty( ResponseHeader.ServiceDiagnostics, false) )
        {
            _warning.store( "ResponseHeader.ServiceDiagnostics is empty but service diagnostics were requested. Diagnostics are not required but are HIGHLY recommended." );
        }
        else if( ResponseHeader.StringTable.length === 0 )
        {
            _warning.store( "StringTable is empty but diagnostics were requested." );
        }
    }
    else
    {
        if( !diagnosticInfoIsEmpty( ResponseHeader.ServiceDiagnostics, true ) )
        {
            addError( "ResponseHeader.ServiceDiagnostics is not empty but service diagnostics were NOT requested. This is not an error, but could cause unnecessary bandwidth on the cable and unnecessary processing on the Client." );
            bSucceeded = false;
        }

        if( ResponseHeader.StringTable.length != 0 )
        {
            addError( "ResponseHeader.StringTable should be empty but is not." );
            addError( "ResponseHeader.StringTable: " + ResponseHeader.StringTable );
            bSucceeded = false;
        }
    }
    return bSucceeded;
}