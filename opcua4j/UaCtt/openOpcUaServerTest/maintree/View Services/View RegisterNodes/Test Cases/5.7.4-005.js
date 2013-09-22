/*    Test 5.7.4-5 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given 100 nodes in nodesToRegister[]
            And the nodes exist
          When RegisterNodes is called
          Then the server returns nodes that refers to the given nodes
            (note: the returned nodeIds can be identical to the passed nodeIds or can be different)

       Revision History:
          2009-10-07 DP: Initial version.
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support RegisterNodes.
*/

/*global include, TestRegisterMultipleNodes
*/

TestRegisterMultipleNodes( 100, 0 );