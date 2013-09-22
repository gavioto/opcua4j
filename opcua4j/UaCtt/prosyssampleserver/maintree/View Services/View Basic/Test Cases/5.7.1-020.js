/*    Test 5.7.1-20 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node has a reference
            And the ResultMask is set to one a combination
          When Browse is called
          Then the server returns Reference Description fields matching the ResultMask
          
          Validation is accomplished by first browsing all Reference Description
          fields of a node, storing the found fields, and comparing them to the
          requested fields.

      Revision History
          2009-09-01 Dale Pope: Initial version.
          2009-11-25 NP: REVIEWED.
          2011-05-06 NP: Revised to use nodeIds from the NodeClasses settings instead of Scalar.
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/result_mask_test.js" );

// The test
function Test571020()
{
    var nodeToBrowse = NodeIdSettings.getMaxNoNodeIds( NodeIdSettings.References(), 1 )[0];
    TestBrowseOneNodeWithResultMask( nodeToBrowse, 0x00, 0 );
    TestBrowseOneNodeWithResultMask( nodeToBrowse, 0x3E, 0 );
    TestBrowseOneNodeWithResultMask( nodeToBrowse, 0x15, 0 );
    TestBrowseOneNodeWithResultMask( nodeToBrowse, 0x2B, 0 );
    TestBrowseOneNodeWithResultMask( nodeToBrowse, 0x07, 0 );
    TestBrowseOneNodeWithResultMask( nodeToBrowse, 0x39, 0 );
    TestBrowseOneNodeWithResultMask( nodeToBrowse, 0x1A, 0 );
    TestBrowseOneNodeWithResultMask( nodeToBrowse, 0x24, 0 );
}

safelyInvoke( Test571020 );