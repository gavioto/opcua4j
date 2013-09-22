/*    Test 5.7.1-Err-6 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the ReferenceTypeId is set to a node ID
            And the ReferenceTypeId does not exist
          When Browse is called
          Then the server returns an operation result of BadReferenceTypeIdInvalid

      Revision History
          2009-08-27 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/bad_referencetypeid_test.js" );

TestBrowseBadReferenceTypeId( UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/UnknownNodeId1" ).toString() ), 0 );
TestBrowseBadReferenceTypeId( UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/UnknownNodeId1" ).toString() ), 0x3ff );