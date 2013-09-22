/*    Test 5.4-2 applied to RegisterNodes (5.7.4) 
        prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given no NodesToRegister
            And diagnostic info is not requested
          When RegisterNodes is called
          Then the server returns specified service diagnostic info

      Revision History:
          2009-10-06 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support RegisterNodes.
*/

/*global include, TestDiagnosticMaskZero, 
  TestRegisterNodesServiceErrorDiagnosticMask
*/

include( "./library/ServiceBased/ViewServiceSet/RegisterNodes/diagnostic_mask_test.js" );
include( "./library/ClassBased/UaRequestHeader/5.4-002.js" );

TestDiagnosticMaskZero( TestRegisterNodesServiceErrorDiagnosticMask );