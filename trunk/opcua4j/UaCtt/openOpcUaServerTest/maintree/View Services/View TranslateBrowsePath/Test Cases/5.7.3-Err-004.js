/*    Test 5.7.3-Err-4 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given a non-existent starting node
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns operation result Bad_NodeIdUnknown.

      Revision History:
          2009-09-21 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2010-03-22 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
*/

/*global BrowseDirection, BrowseToDepth, ExpectedAndAcceptedResults, include, readSetting, safelyInvoke,
  StatusCode, TestTranslateBrowsePathsToNodeIdsMultiMix, UaNodeId, UaQualifiedName
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_mix.js" );

function Test573Err004()
{
    var goodStartingNodeSetting = "/Server Test/NodeIds/Paths/Starting Node 1";
    var goodStartingNodeId = UaNodeId.fromString( readSetting( goodStartingNodeSetting ).toString() );
    if( goodStartingNodeId === undefined || goodStartingNodeId === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '" + goodStartingNodeSetting + "'." );
        return;
    }
    var i;
    var startingNodeIds = [];
    var pathToBrowse;
    var pathsToBrowse = [];
    var expectedOperationResults = [];
    var startingNodeSettings = [
        "/Advanced/NodeIds/Invalid/UnknownNodeId1",
        "/Advanced/NodeIds/Invalid/UnknownNodeId2",
        "/Advanced/NodeIds/Invalid/UnknownNodeId3",
        "/Advanced/NodeIds/Invalid/UnknownNodeId4",
        "/Advanced/NodeIds/Invalid/UnknownNodeId5"
    ];
    
    pathToBrowse = BrowseToDepth( goodStartingNodeId, BrowseDirection.Forward, 1, [] );
    pathToBrowse.targetNodeId = [ ];
    for( i = 0; i < startingNodeSettings.length; i++ )
    {
        startingNodeIds[i] = UaNodeId.fromString( readSetting( startingNodeSettings[i] ).toString() );
        pathsToBrowse[i] = pathToBrowse;
        expectedOperationResults[i] = new ExpectedAndAcceptedResults();
        expectedOperationResults[i].addExpectedResult( StatusCode.BadNodeIdUnknown );
    }

    TestTranslateBrowsePathsToNodeIdsMultiMix( startingNodeIds, pathsToBrowse, expectedOperationResults );
}

safelyInvoke( Test573Err004 );