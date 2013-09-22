/*global UaNodeId, ExpectedAndAcceptedResults, StatusCode, addError
*/

// Modify the specified request to have a non-existent AuthenticationToken
// and then call the execFunction (to execute the service) and the
// assertFunction (to validate the response).
function TestNonexistentAuthenticationToken( execFunction, assertFunction, request, response )
{
    request.RequestHeader.AuthenticationToken = UaNodeId.fromString( "i=3214567890" );
    
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
