/*    Test 5.7.4-Err-1 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an empty list of nodesToRegister[]
          When RegisterNodes is called
          Then the server returns service result Bad_NothingToDo

    Revision History:
          2009-07-31 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support RegisterNodes.
*/

/*global UaRegisterNodesRequest, UaRegisterNodesResponse, Session,
  ExpectedAndAcceptedResults, StatusCode, checkRegisterNodesFailed,
  addError
*/

function RegisterNoNodes( returnDiagnostics )
{
    var request = new UaRegisterNodesRequest();
    var response = new UaRegisterNodesResponse();
    Session.buildRequestHeader( request.RequestHeader );

    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;

    // NodesToRegister[] defaults to be empty, so we can move on

    var uaStatus = Session.registerNodes( request, response );

    // check result
    if( uaStatus.isGood() )
    {
        var ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        checkRegisterNodesFailed( request, response, ExpectedServiceResult );
    }
    else
    {
        addError( "registerNodes() failed", uaStatus );
    }
}

RegisterNoNodes( 0 );
RegisterNoNodes( 0x3ff );