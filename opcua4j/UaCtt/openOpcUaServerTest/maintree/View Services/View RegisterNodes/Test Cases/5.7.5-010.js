/*    Test 5.7.5-10 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given a non-existent node
          When UnregisterNodes is called
          Then the server returns ServiceResult Good

      Revision History
          2009-10-02 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support UnRegisterNodes.
*/

/*global include, addLog, AddNodeIdSettingToUniqueArray, addError,
  RegisterTestNodes, AssertEqual, UaNodeId, readSetting,
  CreateDefaultUnregisterNodesRequest, Session, UaUnregisterNodesResponse,
  checkUnregisterNodesValidParameter, TestUnregisterRegisteredNodes
*/

include( "./library/Base/array.js" );

function Test575010( nodeIdSetting )
{
    var maxLength = 1;
    
    var nodesToUnregister = [];
    AddNodeIdSettingToUniqueArray( nodesToUnregister, nodeIdSetting, maxLength );
    addLog( "Unregistering one non-existent node: " + nodesToUnregister[0] );
    if( nodesToUnregister.length !== maxLength )
    {
        addError( "Test cannot be completed: found " + nodesToUnregister.length + " unique NodeIds of a required " + maxLength );
        return;
    }
    
    TestUnregisterRegisteredNodes( nodesToUnregister, nodesToUnregister, 0 );
}

Test575010( "/Advanced/NodeIds/Invalid/UnknownNodeId1" );
Test575010( "/Advanced/NodeIds/Invalid/UnknownNodeId2" );
Test575010( "/Advanced/NodeIds/Invalid/UnknownNodeId3" );
Test575010( "/Advanced/NodeIds/Invalid/UnknownNodeId4" );
Test575010( "/Advanced/NodeIds/Invalid/UnknownNodeId5" );