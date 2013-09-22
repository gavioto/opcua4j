/*    Test 5.7.1-2 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the node has forward references
            And the node has inverse references
            And the node BrowseDirection is Forward
          When Browse is called
          Then the server returns the Forward references
          
          Validation is accomplished by first browsing all references on a node,
          storing the references flagged with "IsForward = true", and comparing
          the "IsForward = true" references to the "BrowseDirection = Forward" 
          references (expecting them to be equal). So this test only validates 
          that "IsForward = true" is consistent with "BrowseDirection = Forward".

      Revision History
          2009-08-15 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED (verified using SERVER object nodeId).
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/direction_test.js" );

TestBrowseOneNodeInDirection( BrowseDirection.Forward, 0 );
TestBrowseOneNodeInDirection( BrowseDirection.Forward, 0x3ff );