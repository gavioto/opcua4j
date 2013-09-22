/*    Test 5.7.4-7 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given two or three existent nodes
            And two non-existent nodes
          When RegisterNodes is called
          Then the server returns three NodeIds that refer to three existent nodes
            And two NodeIds identical to the two non-existent nodes
            (note: the returned nodeIds can be identical to the passed nodeIds or can be different)

    Revision History:
          2009-09-30 DP: Initial version.
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support RegisterNodes.
*/

/*global include, addLog, CreateDefaultRegisterNodesRequest,
  Session, UaRegisterNodesResponse, AddUniqueNodeToRegister,
  UaNodeId, assertRegisterNodesSuccess, UnregisterTestedNodes,
  addError
*/

function Test574007()
{
    var maxLength = 5;

    addLog( "Registering three existent nodes and two non-existent nodes" );

    var request = CreateDefaultRegisterNodesRequest( Session );
    var response = new UaRegisterNodesResponse();

    var nodesToRegister = [];
    AddNodeIdSettingToUniqueArray( nodesToRegister, "/Server Test/NodeIds/NodeClasses/Variable", maxLength );
    AddNodeIdSettingToUniqueArray( nodesToRegister, "/Server Test/NodeIds/NodeClasses/Object", maxLength );
    AddNodeIdSettingToUniqueArray( nodesToRegister, "/Server Test/NodeIds/NodeClasses/Method", maxLength );
    AddNodeIdSettingToUniqueArray( nodesToRegister, "/Advanced/NodeIds/Invalid/UnknownNodeId1", maxLength );
    AddNodeIdSettingToUniqueArray( nodesToRegister, "/Advanced/NodeIds/Invalid/UnknownNodeId2", maxLength );
    if( nodesToRegister.length < (maxLength-1) )
    {
        addSkipped( "Test cannot be completed: found " + nodesToRegister.length + " unique NodeIds of a required " + (maxLength-1) + ". Check CTT Settings: /Server Test/NodeIds/NodeClasses" );
        return;
    }

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

safelyInvoke( Test574007 );