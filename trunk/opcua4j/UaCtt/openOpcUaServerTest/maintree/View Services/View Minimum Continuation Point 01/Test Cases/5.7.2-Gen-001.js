/*    Test 5.7.2-Gen-1 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given a continuation point
            And the continuation point does not exist
            And diagnostic info is requested
          When BrowseNext is called
          Then the server returns specified operation diagnostic info

          Given no continuation points
            And diagnostic info is requested
          When BrowseNext is called
          Then the server returns specified service diagnostic info.

      Revision History
          2009-09-16 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
*/

/*global include, TestDiagnosticMasks, TestBrowseNextOperationErrorDiagnosticMask,
  TestBrowseNextServiceErrorDiagnosticMask
*/

include( "./library/ServiceBased/ViewServiceSet/BrowseNext/diagnostic_mask_test.js" );
include( "./library/ClassBased/UaRequestHeader/5.4-001.js" );

function browseNextGeneral001()
{
    TestDiagnosticMasks( TestBrowseNextOperationErrorDiagnosticMask );
    TestDiagnosticMasks( TestBrowseNextServiceErrorDiagnosticMask );
}

safelyInvoke( browseNextGeneral001 );