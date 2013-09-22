/*    Test 5.7.1-Gen-2 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node does not exist
            And diagnostic info is not requested
          When Browse is called
          Then the server returns no diagnostic info

      Revision History
          2009-09-15 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
*/

/*global include, TestDiagnosticMaskZero, TestBrowseOperationErrorDiagnosticMask,
  TestBrowseServiceErrorDiagnosticMask
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/diagnostic_mask_test.js" );
include( "./library/ClassBased/UaRequestHeader/5.4-002.js" );

TestDiagnosticMaskZero( TestBrowseOperationErrorDiagnosticMask );
TestDiagnosticMaskZero( TestBrowseServiceErrorDiagnosticMask );