/*    Test 5.7.1-10 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node has more than one reference
            And the nodeClassMask is 0
          When Browse is called
          Then the server returns all references
          
          Validation is accomplished by first browsing all references on a node
          with nodeClassMask = 0xFF, storing the found references, and comparing
          them to the returned references when nodeClassMask is 0.

      Revision History
          2009-08-18 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED (verified using SERVER object nodeId).
*/

include("./library/ServiceBased/ViewServiceSet/Browse/node_class_mask_test.js")

function test571010()
{
    var nodeToBrowse = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has Inverse And Forward References" ).toString() );
    if( nodeToBrowse === undefined || nodeToBrowse === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '/Server Test/NodeIds/References/Has Inverse And Forward References'." );
        return;
    }
    TestBrowseOneNodeWithClassMask( nodeToBrowse, 0, 0 );
    TestBrowseOneNodeWithClassMask( nodeToBrowse, 0, 0x3ff );
}

safelyInvoke( test571010 );