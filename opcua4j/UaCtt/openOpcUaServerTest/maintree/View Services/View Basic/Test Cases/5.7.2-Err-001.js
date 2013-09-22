/*    Test 5.7.2-Err-1 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an empty list of ContinuationPoints[]
          When BrowseNext is called
          Then the server returns service result Bad_NothingToDo

      Revision History
          2009-09-11 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
*/

/*global UaBrowseNextRequest, UaBrowseNextResponse, Session, ExpectedAndAcceptedResults,
  StatusCode, checkBrowseNextFailed, addError
*/

function TestBrowseNextNoContinuationPoints( returnDiagnostics )
{
    var request = new UaBrowseNextRequest();
    var response = new UaBrowseNextResponse();
    Session.buildRequestHeader( request.RequestHeader );
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;

    // ContinuationPoints[] defaults to be empty, so we can move on
    
    var uaStatus = Session.browseNext( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        checkBrowseNextFailed( request, response, expectedServiceResult );
    }
    else
    {
        addError( "browseNext() failed", uaStatus );
    }
}

TestBrowseNextNoContinuationPoints( 0 );
TestBrowseNextNoContinuationPoints( 0x3ff );