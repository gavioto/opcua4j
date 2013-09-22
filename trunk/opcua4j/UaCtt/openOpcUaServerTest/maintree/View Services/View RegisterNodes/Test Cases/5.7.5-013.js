/*    Test 5.7.5-13 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given a NodeId to register
            And the resulting registered NodeId
            And the NodeIds differ
          When UnregisterNodes is called on the NodeId to register
          Then the server returns ServiceResult Good
            And the registered node is still registered

      Revision History
          2009-10-05 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support UnRegisterNodes.
*/

/*global addLog, AddNodeIdSettingToUniqueArray, addError, RegisterTestNodes,
  AssertEqual, TestUnregisterRegisteredNodes, ReadBrowseNameOfRegisteredNode,
  AssertBrowseNamesEqual
*/

function Test575013()
{
    var maxLength = 1;
    
    addLog( "Unregistering a \"source\" NodeId" );
    
    // register a node
    var nodesToRegister = [];
    AddNodeIdSettingToUniqueArray( nodesToRegister, "/Server Test/NodeIds/NodeClasses/Variable", maxLength );
    if( nodesToRegister.length !== maxLength )
    {
        addError( "Test cannot be completed: found " + nodesToRegister.length + " unique NodeIds of a required " + maxLength );
        return;
    }
    var registeredNodes = RegisterTestNodes( nodesToRegister );
    if( !AssertEqual( nodesToRegister.length, registeredNodes.length, "Test cannot be completed: Wrong number of nodes registered" ) )
    {
        return;
    }

    // unregister the "source" node
    TestUnregisterRegisteredNodes( nodesToRegister, nodesToRegister, 0 );
    
    // validate the registered node is still registered
    for( var i = 0; i < nodesToRegister; i++)
    {
        var registeredBrowseName = ReadBrowseNameOfRegisteredNode( registeredNodes[i] );
        if( !registeredBrowseName.isEmpty() )
        {
            // registered NodeId exists, so compare the BrowseName to the source node's BrowseName
            var sourceBrowseName = ReadBrowseNameOfRegisteredNode( nodesToRegister[i] );
            AssertBrowseNamesEqual( sourceBrowseName, registeredBrowseName, "Source NodeId does not refer to the same node as the registered NodeId." );
        }
        else
        {
            addError( "Could not read BrowseName from registered NodeId: " + registeredNodes[i] );
        }
    }
    
    // unregister the registered node
    TestUnregisterRegisteredNodes( registeredNodes, nodesToRegister, 0 );
}

safelyInvoke( Test575013 );