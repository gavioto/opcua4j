/*    Test 5.7.3-5 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one existent starting node
            And one relativePath element
            And the relativePath element's IncludeSubtypes = true
            And the relativePath element's ReferenceTypeId is a parent of the target node's type
            And the relativePath nodes exist
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns the NodeId of the relativePath element

          Validation is accomplished by comparing the returned NodeId against
          an expected NodeId stored in settings.

      Revision History
          2009-09-18 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
          2010-03-19 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
*/

/*global AssertEqual, AssertNotNullOrEmpty, BrowseDirection, BrowseToDepth, 
  GetReferenceTypeFirstParent, include, readSetting, 
  TestTranslateBrowsePathsToNodeIdsIncludeSubtypes, UaNodeId
*/
 
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_basic.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/get_references.js");

function Test573005( startingNodeSetting, pathLength )
{
    var startingNodeId = UaNodeId.fromString( readSetting( startingNodeSetting ).toString() );
    
    // use Browse to find browseNames, referenceTypeIds, and targetNode
    var pathToBrowse = BrowseToDepth( startingNodeId, BrowseDirection.Forward, pathLength, [] );
    if( !AssertNotNullOrEmpty( pathToBrowse, "Test cannot be completed: could not browse any references from StartingNode " + startingNodeSetting ) )
    {
        return;
    }
    AssertEqual( pathLength, pathToBrowse.browseNames.length, "Test cannot be completed: could not create a TranslateBrowsePathsToNodeIds test of the required length from StartingNode " + startingNodeSetting );

    // look up parents of the exact referenceTypeIds
    for( var i = 0; i < pathToBrowse.referenceTypeIds.length; i++ )
    {
        pathToBrowse.referenceTypeIds[i] = GetReferenceTypeFirstParent( pathToBrowse.referenceTypeIds[i] );
    }
    
    pathToBrowse.addLog( startingNodeSetting, startingNodeId );

    TestTranslateBrowsePathsToNodeIdsIncludeSubtypes(
        startingNodeId,
        pathToBrowse.browseNames,
        pathToBrowse.referenceTypeIds,
        pathToBrowse.targetNodeId,
        pathLength
    );
}

// test with one relativePath elements
Test573005(
    "/Server Test/NodeIds/Paths/Starting Node 1",
    1
);

// test with four relativePath elements
Test573005(
    "/Server Test/NodeIds/Paths/Starting Node 1",
    4
);