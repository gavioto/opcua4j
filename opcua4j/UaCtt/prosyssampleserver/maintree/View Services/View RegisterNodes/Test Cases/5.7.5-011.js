/*    Test 5.7.5-11 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given a node
            And the node is unregistered
          When UnregisterNodes is called
          Then the server returns ServiceResult Good
            And ignores the unregistered node

      Revision History
          2009-10-05 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support UnRegisterNodes.
*/

/*global TestUnregisterMultipleNodesTwice
*/

TestUnregisterMultipleNodesTwice( 1, 0 );