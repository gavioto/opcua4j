/*global UaNodeId, ExpectedAndAcceptedResults, StatusCode, addError
*/

// Modify the specified request to have a null/empty AuthenticationToken
// and then call the execFunction (to execute the service) and the
// assertFunction (to validate the response).
function TestNullAuthenticationToken( execFunction, assertFunction, request, response )
{
    request.RequestHeader.AuthenticationToken = new UaNodeId();
    
    var uaStatus = execFunction( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadSessionIdInvalid );
        expectedServiceResult.addExpectedResult( StatusCode.BadSessionClosed );
        assertFunction( request, response, expectedServiceResult );
    }
    else
    {
        addError( "service failed: " + uaStatus, uaStatus );
    }
}
