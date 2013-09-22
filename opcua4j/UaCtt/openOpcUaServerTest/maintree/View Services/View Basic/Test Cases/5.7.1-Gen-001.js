/*    Test 5.7.1-Gen-1 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node does not exist
            And diagnostic info is requested
          When Browse is called
          Then the server returns specified operation diagnostic info

          Given no nodes to browse
            And diagnostic info is requested
          When Browse is called
          Then the server returns specified service diagnostic info

      Revision History
          2009-09-15 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
*/

/*global include, TestDiagnosticMasks, TestBrowseOperationErrorDiagnosticMask,
  TestBrowseServiceErrorDiagnosticMask
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/diagnostic_mask_test.js" );
include( "./library/ClassBased/UaRequestHeader/5.4-001.js" );

TestDiagnosticMasks( TestBrowseOperationErrorDiagnosticMask );
TestDiagnosticMasks( TestBrowseServiceErrorDiagnosticMask );