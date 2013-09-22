/*    Test 5.7.4-Err-4 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given 500 nodes
            And the nodes do not exist
          When RegisterNodes is called
          Then the server returns the NodeIds

      Revision History:
          2009-09-30 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support RegisterNodes.
*/

/*global include, UaNodeId, readSetting, addLog, 
  CreateDefaultRegisterNodesRequest, Session, 
  UaRegisterNodesResponse, assertRegisterNodesSuccess,
  UnregisterTestedNodes, ExpectedAndAcceptedResults,
  StatusCode, checkRegisterNodesFailed, addError
*/

include( "./library/Base/array.js" );

function Test574Err004( )
{
    var maxLength = 500;
    var nodeToRegister = UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/UnknownNodeId2" ).toString() );

    addLog( "Registering " + maxLength + " non-existent nodes" );

    var request = CreateDefaultRegisterNodesRequest( Session );
    var response = new UaRegisterNodesResponse();

    // add the node multiple times
    for( var i = 0; i < maxLength; i++ )
    {
        request.NodesToRegister[i] = nodeToRegister;
    }

    var uaStatus = Session.registerNodes( request, response );
    
    // check result (could be Good or Bad_TooManyOperations)
    if( uaStatus.isGood() )
    {
        if( response.ResponseHeader.ServiceResult.isGood() )
        {
            assertRegisterNodesSuccess( request, response, false );
            UnregisterTestedNodes( response.RegisteredNodeIds );
        }
        else
        {
            var ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadTooManyOperations );
            checkRegisterNodesFailed( request, response, ExpectedServiceResult );
        }
    }
    else
    {
        addError( "registerNodes() returned failed", uaStatus );
    }
}

safelyInvoke( Test574Err004 );