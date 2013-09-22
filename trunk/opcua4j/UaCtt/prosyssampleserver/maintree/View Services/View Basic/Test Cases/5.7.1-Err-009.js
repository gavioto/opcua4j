/*    Test 5.7.1-Err-9 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an empty list of NodesToBrowes[]
          When Browse is called
          Then the server returns service result Bad_NothingToDo

      Revision History
          2009-08-07 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
*/

function TestBrowseNoNodes( returnDiagnostics )
{
    var request = new UaBrowseRequest();
    var response = new UaBrowseResponse();
    Session.buildRequestHeader( request.RequestHeader );
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;

    // NodesToBrowse[] defaults to be empty, so we can move on
    
    var uaStatus = Session.browse( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        checkBrowseFailed( request, response, expectedServiceResult );
    }
    else
    {
        addError( "browse() failed", uaStatus );
    }
}

TestBrowseNoNodes( 0 );
TestBrowseNoNodes( 0x3ff );