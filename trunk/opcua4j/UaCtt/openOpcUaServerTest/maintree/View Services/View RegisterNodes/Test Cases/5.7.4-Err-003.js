/*    Test 5.7.4-Err-3 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node
            And the node does not exist
          When RegisterNodes is called
          Then the server returns the NodeId

        Revision History:
          2009-09-30 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support RegisterNodes.
*/

/*global include, AddUniqueNodeToRegister, addLog, 
  CreateDefaultRegisterNodesRequest, Session, UaRegisterNodesResponse, 
  addError, assertRegisterNodesSuccess, UnregisterTestedNodes,
*/

include( "./library/Base/array.js" );

function Test574Err003( nodeIdSetting )
{
    var maxLength = 1;
    
    var nodesToRegister = [];
    AddNodeIdSettingToUniqueArray( nodesToRegister, nodeIdSetting, maxLength );
    addLog( "Registering one non-existent node: " + nodesToRegister[0] );
    if( nodesToRegister.length !== maxLength )
    {
        addError( "Test cannot be completed: found " + nodesToRegister.length + " unique NodeIds of a required " + maxLength );
        return;
    }

    var request = CreateDefaultRegisterNodesRequest( Session );
    var response = new UaRegisterNodesResponse();

    for( var i = 0; i < nodesToRegister.length; i++ )
    {
        request.NodesToRegister[i] = nodesToRegister[i];
    }

    var uaStatus = Session.registerNodes( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        assertRegisterNodesSuccess( request, response, false );
        UnregisterTestedNodes( response.RegisteredNodeIds );
    }
    else
    {
        addError( "registerNodes() returned failed", uaStatus );
    }
}

Test574Err003( "/Advanced/NodeIds/Invalid/UnknownNodeId1" );
Test574Err003( "/Advanced/NodeIds/Invalid/UnknownNodeId2" );
Test574Err003( "/Advanced/NodeIds/Invalid/UnknownNodeId3" );
Test574Err003( "/Advanced/NodeIds/Invalid/UnknownNodeId4" );
Test574Err003( "/Advanced/NodeIds/Invalid/UnknownNodeId5" );