/*    Test 5.7.3-4 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one existent starting node
            And one relativePath element
            And the relativePath element's IsInverse = true
            And the relativePath nodes exist
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns the NodeId of the relativePath element
          
          Validation is accomplished by comparing the returned NodeId against
          an expected NodeId stored in settings.

      Revision History
          2009-09-18 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
          2010-03-19 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
*/

/*global include, readSetting, TestTranslateBrowsePathsToNodeIdsInverse, UaNodeId
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_basic.js" );

TestTranslateBrowsePathsToNodeIdsInverse( "/Server Test/NodeIds/Paths/Starting Node 1", 1 );