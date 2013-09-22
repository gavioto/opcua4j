/*    Test 5.7.4-3 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given 25 nodes in nodesToRegister[]
            And the nodes exist
          When RegisterNodes is called
          Then the server returns nodes that refers to the given nodes
            (note: the returned nodeIds can be identical to the passed nodeIds or can be different)

        Revision History:
          2009-09-29 DP: Initial version.
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support RegisterNodes.
*/

/*global include, TestRegisterMultipleNodes
*/

include( "./library/Base/array.js" );

TestRegisterMultipleNodes( 25, 0 );