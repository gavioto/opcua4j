include( "./library/ClassBased/UaDiagnosticInfo/diagnositcInfoIsEmpty.js" );
include( "./library/Base/check_timestamp.js" );
include( "./library/Base/assertions.js" );

function checkResponseHeaderValid( requestHeader, responseHeader, exactStatusCode, suppressTimeValidation, suppressMessaging )
{
    var succeeded = true;

    // check in parameters
    if( arguments.length < 2 )
    {
        addError( "function checkResponseHeaderValid( RequestHeader, ResponseHeader ): Number of arguments must be at least 2!" );
        return false;
    }

    // get current time to validate the timestamp
    var currentClientTime = UaDateTime.utcNow();

    // request handle
    if( !AssertEqual( requestHeader.RequestHandle, responseHeader.RequestHandle, "ResponseHeader.RequestHandle does not match the RequestHeader.RequestHandle" ) )
    {
        succeeded = false;
    }

    // service result
    if( responseHeader.ServiceResult.isGood() )
    {
        if( exactStatusCode !== null && exactStatusCode !== undefined )
        {
            AssertStatusCodeIs( exactStatusCode, responseHeader.ServiceResult, "ServiceResult was not " + new UaStatusCode( exactStatusCode ) );
        }
        else
        {
            if( suppressMessaging === undefined || suppressMessaging == false ) print( "ServiceResult was good.", responseHeader.ServiceResult );
        }
    }
    else
    {
        if( responseHeader.ServiceResult.StatusCode === StatusCode.BadNotImplemented )
        {
            addNotSupported( "Received Bad_NotImplemented. Use Bad_ServiceUnsupported instead." );
        }
        else if( responseHeader.ServiceResult.StatusCode === StatusCode.BadServiceUnsupported )
        {
            addNotSupported( "Received Bad_ServiceUnsupported" );
        }
        else
        {
            addError( "ServiceResult: " + responseHeader.ServiceResult, responseHeader.ServiceResult );
        }
        succeeded = false;
    }

    // service diagnostic
    if( diagnosticInfoIsEmpty( responseHeader.ServiceDiagnostics, true ) )
    {
        // did we request diagnostics?
        if( requestHeader.ReturnDiagnostics !== 0 )
        {
            if( responseHeader.ServiceResult.StatusCode === StatusCode.Good )
            {
                if( suppressMessaging === undefined || suppressMessaging == false ) addLog( "Diagnostics were requested, but the ServiceResult was GOOD. Server is not required to submit diagnostics." );
            }
            else
            {
                if( suppressMessaging === undefined || suppressMessaging == false ) addLog( "Diagnostics were requested, but the ResponseHeader.ServiceDiagnostics are empty. Diagnostics are not mandatory, but are recommended." );
                _notSupported.store( "Diagnostics" );
            }
        }
        else
        {
            if( suppressMessaging === undefined || suppressMessaging == false ) print( "ResponseHeader.ServiceDiagnostics is empty, and no diagnostics were requested." );
        }
    }
    else
    {
        // did we ask for diagnostics even though we received them?
        if( requestHeader.ReturnDiagnostics !== 0 && ( suppressMessaging === undefined || suppressMessaging == false ) )
        {
            addLog( "Diagnostics were requested and received." );
        }
        else
        {
            addLog( "ResponseHeader.ServiceDiagnostics contains diagnostics even though none were requested." );
        }
    }    

    // string table
    if( responseHeader.StringTable.length !== 0 )
    {
        if( responseHeader.ServiceResult.isGood() )
        {
            addError( "StringTable should be empty but contains " + responseHeader.StringTable.length + " entries." );
            succeeded = false;
        }
        else
        {
            var stc = "StringTable contains:";
            for( var st=0; st<responseHeader.StringTable.length; st++ )
            {
                stc += "\n\t" + responseHeader.StringTable[st];
            }//for st
            addError( stc );
        }
    }

    // timestamp
    if( !suppressTimeValidation )
    {
        validateTimestamp( responseHeader.Timestamp, currentClientTime, 1000, true, suppressMessaging );
    }

    return succeeded;
}