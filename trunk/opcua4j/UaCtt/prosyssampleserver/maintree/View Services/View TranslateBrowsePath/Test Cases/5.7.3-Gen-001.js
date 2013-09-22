/*    Test 5.4-1 applied to TranslateBrowsePathsToNodeIds (5.7.3) 
        prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one starting node
            And the node does not exist
            And diagnostic info is requested
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns specified operation diagnostic info

          Given no BrowsePaths
            And diagnostic info is requested
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns specified service diagnostic info.

      Revision History:
          2009-09-24 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
*/

/*global include, TestDiagnosticMasks, 
  TestTranslateBrowsePathsToNodeIdsOperationErrorDiagnosticMask,
  TestTranslateBrowsePathsToNodeIdsServiceErrorDiagnosticMask
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_mix.js" );
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/diagnostic_mask_test.js" );
include( "./library/ClassBased/UaRequestHeader/5.4-001.js" );


TestDiagnosticMasks( TestTranslateBrowsePathsToNodeIdsOperationErrorDiagnosticMask );
TestDiagnosticMasks( TestTranslateBrowsePathsToNodeIdsServiceErrorDiagnosticMask );