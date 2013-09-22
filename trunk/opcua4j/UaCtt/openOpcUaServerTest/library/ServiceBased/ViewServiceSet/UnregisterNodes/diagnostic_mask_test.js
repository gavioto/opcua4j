/*global addLog, UaUnregisterNodesRequest, UaUnregisterNodesResponse,
  Session, ExpectedAndAcceptedResults, StatusCode, 
  checkUnregisterNodesFailed, addError
*/


// generate service error and validate diagnostics
function TestUnregisterNodesServiceErrorDiagnosticMask( returnDiagnosticMask )
{
    addLog( "Testing RegisterNodes service error with RequestHeader.ReturnDiagnostics = " + returnDiagnosticMask );

    var request = new UaUnregisterNodesRequest();
    var response = new UaUnregisterNodesResponse();
    Session.buildRequestHeader( request.RequestHeader );
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnosticMask;

    // NodesToRegister[] defaults to be empty, so we can move on
    
    var uaStatus = Session.unregisterNodes( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        checkUnregisterNodesFailed( request, response, expectedServiceResult );
    }
    else
    {
        addError( "UnregisterNodes() status " + uaStatus, uaStatus );
    }
}