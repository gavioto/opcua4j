include( "./library/Base/warnOnce.js" );

/*global UaDateTime, ExpectedAndAcceptedResults, StatusCode, addError
*/

// Modify the specified request to have a non-existent AuthenticationToken
// and then call the execFunction (to execute the service) and the
// assertFunction (to validate the response).
function TestInvalidRequestHeaderTimestamp( execFunction, assertFunction, request, response )
{
    request.RequestHeader.Timestamp = UaDateTime.fromString( "1601-01-01T00:00:00.000Z" );
    
    var uaStatus = execFunction( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadInvalidTimestamp );
        expectedServiceResult.addExpectedResult( StatusCode.Good );
        assertFunction( request, response, expectedServiceResult );
        // if the server doesn't return the error - that is fine - but we will log
        // a NotImplemented message that recommends checking it
        if( response.ResponseHeader.ServiceResult.StatusCode !== StatusCode.BadInvalidTimestamp )
        {
            _notSupported.store( "RequestHeader.Timestamp" );
            addLog( "The Server does not check the timestamp in the request header - this is allowed, but not a recommended best practice." );
        }
    }
    else
    {
        addError( "service failed: " + uaStatus, uaStatus );
    }
}
