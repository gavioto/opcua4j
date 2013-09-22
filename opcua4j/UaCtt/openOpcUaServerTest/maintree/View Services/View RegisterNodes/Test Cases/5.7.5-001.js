/*    Test 5.7.5-1 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node in nodesToUnregister[]
            And the node exists
          When UnregisterNodes is called
          Then the server returns ServiceResult Good
            And unregisters the node

      Revision History:
          2009-10-02 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support UnRegisterNodes.
*/

/*global TestUnregisterNodes, UaNodeId, readSetting
*/

var item = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() )[0];
TestUnregisterNodes( [ item.NodeId ], 0 );
TestUnregisterNodes( [ item.NodeId ], 0x3ff );