/*    Test 5.7.4-6 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node repeated multiple times in nodesToRegister[]
            And the node exists
          When RegisterNodes is called
          Then the server returns nodes that refer to the given node
            (note: the returned nodeIds can be identical to the passed nodeIds or can be different)

    Revision History:
          2009-09-29 DP: Initial version.
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support RegisterNodes.
*/

/*global include, addLog, CreateDefaultRegisterNodesRequest,
  Session, UaRegisterNodesResponse, UaNodeId, readSetting,
  assertRegisterNodesSuccess, UnregisterTestedNodes, addError
*/

include( "./library/Base/array.js" );

function Test574006()
{
    var maxLength = 20;

    addLog( "Registering the same node " + maxLength + " times" );

    var request = CreateDefaultRegisterNodesRequest( Session );
    var response = new UaRegisterNodesResponse();

    var nodeToRegister = UaNodeId.fromString( readSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" ).name ).toString() );

    // add the node multiple times
    for( var i = 0; i < maxLength; i++ )
    {
        request.NodesToRegister[i] = nodeToRegister;
    }

    var uaStatus = Session.registerNodes( request, response );
    if( uaStatus.isGood() )
    {
        assertRegisterNodesSuccess( request, response );
        UnregisterTestedNodes( response.RegisteredNodeIds );
    }
    else
    {
        addError( "registerNodes() failed", uaStatus );
    }
}

safelyInvoke( Test574006 );