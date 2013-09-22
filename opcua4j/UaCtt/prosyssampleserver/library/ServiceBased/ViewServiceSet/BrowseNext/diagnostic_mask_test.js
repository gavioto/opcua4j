/*global addLog, CreateDefaultBrowseNextRequest, Session, 
  UaByteString, UaBrowseNextResponse, ExpectedAndAcceptedResults,
  StatusCode, checkBrowseNextError, addError, UaBrowseNextRequest,
  checkBrowseNextFailed
*/

// generate an operation error and validate diagnostics
function TestBrowseNextOperationErrorDiagnosticMask( returnDiagnosticMask )
{
    addLog( "Testing BrowseNext operation error with RequestHeader.ReturnDiagnostics = " + returnDiagnosticMask );
    
    var request = CreateDefaultBrowseNextRequest( Session );
    request.ContinuationPoints[0] = new UaByteString( "NotReal" );

    var response = new UaBrowseNextResponse();
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnosticMask;
    
    var uaStatus = Session.browseNext( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedOperationResultsArray = [1];
        expectedOperationResultsArray[0] = new ExpectedAndAcceptedResults();
        expectedOperationResultsArray[0].addExpectedResult( StatusCode.BadContinuationPointInvalid );
        
        // relying on assertBrowseError to validate diagnostics (is that complete enough?)
        checkBrowseNextError( request, response, expectedOperationResultsArray );
    }
    else
    {
        addError( "BrowseNext() status " + uaStatus, uaStatus );
    }
}


// generate service error and validate diagnostics
function TestBrowseNextServiceErrorDiagnosticMask( returnDiagnosticMask )
{
    print( "Testing BrowseNext service error with RequestHeader.ReturnDiagnostics = " + returnDiagnosticMask );

    var request = new UaBrowseNextRequest();
    var response = new UaBrowseNextResponse();
    Session.buildRequestHeader( request.RequestHeader );
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnosticMask;

    // ContinuationPoints[] defaults to be empty, so we can move on
    
    var uaStatus = Session.browseNext( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        
        // relying on checkBrowseFailed to validate diagnostics (is that complete enough?)
        checkBrowseNextFailed( request, response, expectedServiceResult );
    }
    else
    {
        addError( "BrowseNext() status " + uaStatus, uaStatus );
    }
}