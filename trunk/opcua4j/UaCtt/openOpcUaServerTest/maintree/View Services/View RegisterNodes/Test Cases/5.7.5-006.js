/*    Test 5.7.5-6 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given two or three registered nodes
            And two non-registered nodes
          When UnregisterNodes is called
          Then the server returns ServiceResult Good
            And unregisters the registered nodes
            And ignores the non-registered nodes

      Revision History
          2009-10-02 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support UnRegisterNodes.
*/

/*global addLog, AddNodeIdSettingToUniqueArray, addError,
  RegisterTestNodes, AssertEqual, UaNodeId, readSetting,
  TestUnregisterRegisteredNodes
*/

function Test575006()
{
    var maxLength = 3;
    
    addLog( "Unregistering three registered nodes and two non-registered nodes" );
    
    // register three nodes
    var nodesToRegister = [];
    AddNodeIdSettingToUniqueArray( nodesToRegister, "/Server Test/NodeIds/NodeClasses/Variable", maxLength );
    AddNodeIdSettingToUniqueArray( nodesToRegister, "/Server Test/NodeIds/NodeClasses/Object", maxLength );
    AddNodeIdSettingToUniqueArray( nodesToRegister, "/Server Test/NodeIds/NodeClasses/Method", maxLength );
    if( nodesToRegister.length < (maxLength-1) )
    {
        addSkipped( "Test cannot be completed: found " + nodesToRegister.length + " unique NodeIds of a required " + (maxLength-1) + ". Check CTT settings: /Server Test/NodeIds/NodeClasses" );
        return;
    }
    var nodesToUnregister = RegisterTestNodes( nodesToRegister );
    if( !AssertEqual( nodesToRegister.length, nodesToUnregister.length, "Test cannot be completed: Wrong number of nodes registered" ) )
    {
        return;
    }

    // add non-registered nodes to both arrays
    nodesToRegister.push( UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/ObjectType" ).toString() ) );
    nodesToUnregister[nodesToUnregister.length] = nodesToRegister[nodesToUnregister.length];
    nodesToRegister.push( UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/VariableType" ).toString() ) );
    nodesToUnregister[nodesToUnregister.length] = nodesToRegister[nodesToUnregister.length];

    // unregister five nodes
    TestUnregisterRegisteredNodes( nodesToUnregister, nodesToRegister, 0 );
}

safelyInvoke( Test575006 );