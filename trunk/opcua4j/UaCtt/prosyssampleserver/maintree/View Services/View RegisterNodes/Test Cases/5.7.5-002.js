/*    Test 5.7.5-2 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given five nodes in nodesToUnregister[]
            And the nodes exist
          When UnregisterNodes is called
          Then the server returns ServiceResult Good
            And unregisters the nodes

      Revision History
          2009-10-02 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support UnRegisterNodes.
*/

/*global include, TestUnregisterMultipleNodes
*/

include( "./library/Base/array.js" );

TestUnregisterMultipleNodes( 5, 0 );