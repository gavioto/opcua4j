/*    Test 5.7.3-14 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one existent starting node
            And one relativePath element
            And the relativePath element's IncludeSubtypes = true
            And the relativePath element's ReferenceTypeId is the target node's type
            And the relativePath nodes exist
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns the NodeId of the relativePath element

          Validation is accomplished by comparing the returned NodeId against
          an expected NodeId stored in settings.

      Revision History
          2009-09-29 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
          2010-03-21 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
*/

/*global AssertEqual, BrowseDirection, BrowseToDepth, GetReferenceTypeFirstParent, include, 
  readSetting, TestTranslateBrowsePathsToNodeIdsIncludeSubtypes, UaNodeId, safelyInvoke
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_basic.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/get_references.js");

function Test573014()
{
    var startingNodeSetting = "/Server Test/NodeIds/Paths/Starting Node 1";
    var startingNodeId = UaNodeId.fromString( readSetting( startingNodeSetting ).toString() );
    if( startingNodeId === undefined || startingNodeId === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting 'Starting Node 1'." );
        return;
    }

    var pathLength = 1;
    
    // use Browse to find browseNames, referenceTypeIds, and targetNode
    var pathToBrowse = BrowseToDepth( startingNodeId, BrowseDirection.Forward, pathLength, [] );
    if( pathToBrowse !== null )
    {
        AssertEqual( pathLength, pathToBrowse.browseNames.length, "Test cannot be completed: could not create a TranslateBrowsePathsToNodeIds test of the required length from StartingNode " + startingNodeSetting );

        pathToBrowse.addLog( startingNodeSetting, startingNodeId );

        // test with one relativePath element
        TestTranslateBrowsePathsToNodeIdsIncludeSubtypes(
            startingNodeId,
            pathToBrowse.browseNames,
            pathToBrowse.referenceTypeIds,
            pathToBrowse.targetNodeId,
            pathLength
        );

        pathLength = 4;
    
        // use Browse to find browseNames, referenceTypeIds, and targetNode
        pathToBrowse = BrowseToDepth( startingNodeId, BrowseDirection.Forward, pathLength, [] );
        if( pathToBrowse !== null )
        {
            AssertEqual( pathLength, pathToBrowse.browseNames.length, "Test cannot be completed: could not create a TranslateBrowsePathsToNodeIds test of the required length from StartingNode " + startingNodeSetting );

            pathToBrowse.addLog( startingNodeSetting, startingNodeId );
    
            // test with four relativePath elements
            TestTranslateBrowsePathsToNodeIdsIncludeSubtypes(
                startingNodeId,
                pathToBrowse.browseNames,
                pathToBrowse.referenceTypeIds,
                pathToBrowse.targetNodeId,
                pathLength
            );
        }
        else
        {
            addSkipped( "Unable to obtain a path to Browse for the 2nd part of this test. Can't test TranslateBrowsePathsToNodeIds." );
        }
    }
    else
    {
        addSkipped( "Unable to obtain a path to Browse for the first part of this test. Can't test TranslateBrowsePathsToNodeIds." );
    }
}

safelyInvoke( Test573014 );