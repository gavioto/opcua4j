/*    Test 5.7.4-1 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node in nodesToRegister[]
            And the node exists
          When RegisterNodes is called
          Then the server returns a node that refers to the given node
            (note: the returned nodeId can be identical to the passed nodeId or can be different)

      Revision History:
          2009-08-03 DP: Initial version.
*/

/*global TestRegisterNodes, UaNodeId, readSetting
*/

function register574001()
{
    var item = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "iud" ).name );
    if( item === undefined || item === null )
    {
        addError( "Unable to perform test. No numeric nodes configured for testing." );
        return;
    }

    TestRegisterNodes( [ item.NodeId ], 0 );
    TestRegisterNodes( [ item.NodeId ], 0x3ff );
}

safelyInvoke( register574001 );