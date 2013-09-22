/*    Test 5.7.3-Err-3 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given no BrowsePath elements
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns the service result Bad_NothingToDo
      Revision History
          2009-09-20 Dale Pope: Initial version
*/

/*global UaTranslateBrowsePathsToNodeIdsRequest,
  UaTranslateBrowsePathsToNodeIdsResponse, Session,
  ExpectedAndAcceptedResults, StatusCode, addError
  checkTranslateBrowsePathsToNodeIdsFailed

*/


function Test573Err003( returnDiagnostics )
{
    var request = new UaTranslateBrowsePathsToNodeIdsRequest();
    var response = new UaTranslateBrowsePathsToNodeIdsResponse();
    Session.buildRequestHeader( request.RequestHeader );
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;

    // BrowsePaths[] defaults to be empty, so we can move on
    
    var uaStatus = Session.translateBrowsePathsToNodeIds( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        checkTranslateBrowsePathsToNodeIdsFailed( request, response, expectedServiceResult );
    }
    else
    {
        addError( "translateBrowsePathsToNodeIds() failed", uaStatus );
    }
}


Test573Err003( 0 );
Test573Err003( 0x3ff );