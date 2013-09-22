/*global addLog, UaNodeId, readSetting, GetDefaultBrowseRequest,
  Session, UaBrowseResponse, ExpectedAndAcceptedResults, StatusCode,
  assertBrowseError, addError, UaBrowseRequest, checkBrowseFailed
*/

// generate an operation error and validate diagnostics
function TestBrowseOperationErrorDiagnosticMask( returnDiagnosticMask )
{
    addLog( "Testing Browse operation error with RequestHeader.ReturnDiagnostics = " + returnDiagnosticMask );
    
    var nodeToBrowse = UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/UnknownNodeId1" ).toString() );
    var request = GetDefaultBrowseRequest( Session, nodeToBrowse );
    var response = new UaBrowseResponse();
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnosticMask;
    
    var uaStatus = Session.browse( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedOperationResultsArray = [1];
        expectedOperationResultsArray[0] = new ExpectedAndAcceptedResults();
        expectedOperationResultsArray[0].addExpectedResult( StatusCode.BadNodeIdUnknown );
        
        // relying on assertBrowseError to validate diagnostics (is that complete enough?)
        assertBrowseError( request, response, expectedOperationResultsArray );
    }
    else
    {
        addError( "Browse() status " + uaStatus, uaStatus );
    }
}


// generate service error and validate diagnostics
function TestBrowseServiceErrorDiagnosticMask( returnDiagnosticMask )
{
    print( "Testing Browse service error with RequestHeader.ReturnDiagnostics = " + returnDiagnosticMask );

    var request = new UaBrowseRequest();
    var response = new UaBrowseResponse();
    Session.buildRequestHeader( request.RequestHeader );
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnosticMask;

    // NodesToBrowse[] defaults to be empty, so we can move on
    
    var uaStatus = Session.browse( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        
        // relying on checkBrowseFailed to validate diagnostics (is that complete enough?)
        checkBrowseFailed( request, response, expectedServiceResult );
    }
    else
    {
        addError( "Browse() status " + uaStatus, uaStatus );
    }
}
