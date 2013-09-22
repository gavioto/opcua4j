/*global addLog, UaRegisterNodesRequest, UaRegisterNodesResponse,
  Session, ExpectedAndAcceptedResults, StatusCode, 
  checkRegisterNodesFailed, addError
*/


// generate service error and validate diagnostics
function TestRegisterNodesServiceErrorDiagnosticMask( returnDiagnosticMask )
{
    addLog( "Testing RegisterNodes service error with RequestHeader.ReturnDiagnostics = " + returnDiagnosticMask );

    var request = new UaRegisterNodesRequest();
    var response = new UaRegisterNodesResponse();
    Session.buildRequestHeader( request.RequestHeader );
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnosticMask;

    // NodesToRegister[] defaults to be empty, so we can move on
    
    var uaStatus = Session.registerNodes( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        checkRegisterNodesFailed( request, response, expectedServiceResult );
    }
    else
    {
        addError( "RegisterNodes() status " + uaStatus, uaStatus );
    }
}