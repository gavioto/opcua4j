/*    Test 5.4-2 applied to TranslateBrowsePathsToNodeIds (5.7.3) 
        prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one starting node
            And the node does not exist
            And diagnostic info is not requested
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns no diagnostic info.

      Revision History:
          2009-09-25 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
*/

/*global include, TestDiagnosticMaskZero, 
  TestTranslateBrowsePathsToNodeIdsOperationErrorDiagnosticMask,
  TestTranslateBrowsePathsToNodeIdsServiceErrorDiagnosticMask
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_mix.js" );
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/diagnostic_mask_test.js" );
include( "./library/ClassBased/UaRequestHeader/5.4-002.js" );

TestDiagnosticMaskZero( TestTranslateBrowsePathsToNodeIdsOperationErrorDiagnosticMask );
TestDiagnosticMaskZero( TestTranslateBrowsePathsToNodeIdsServiceErrorDiagnosticMask );