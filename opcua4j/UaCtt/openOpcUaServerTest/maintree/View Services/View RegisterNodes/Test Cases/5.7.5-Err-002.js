/*    Test 5.7.5-Err-2 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an empty list of nodesToUnregister[]
          When UnregisterNodes is called
          Then the server returns service result Bad_NothingToDo

      Revision History
          2009-10-06 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support UnRegisterNodes.
*/

/*global UaUnregisterNodesRequest, UaUnregisterNodesResponse, Session,
  ExpectedAndAcceptedResults, StatusCode, checkUnregisterNodesFailed, addError
*/

function UnregisterNoNodes( returnDiagnostics )
{
    var request = new UaUnregisterNodesRequest();
    var response = new UaUnregisterNodesResponse();
    Session.buildRequestHeader( request.RequestHeader );
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;

    // NodesToUnregister[] defaults to be empty, so we can move on
    
    var uaStatus = Session.unregisterNodes( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        checkUnregisterNodesFailed( request, response, ExpectedServiceResult );
    }
    else
    {
        addError( "unregisterNodes() failed", uaStatus );
    }
}

UnregisterNoNodes( 0 );
UnregisterNoNodes( 0x3ff );