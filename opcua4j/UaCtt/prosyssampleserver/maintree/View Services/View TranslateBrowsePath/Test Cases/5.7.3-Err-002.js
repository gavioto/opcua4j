/*    Test 5.7.3-Err-2 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given two existent starting nodes
            And two existent browsePaths
            And one non-existent starting node
            And one existent starting node
            And one non-existent browsePath
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns the NodeId of the last relativePath element for each matching combo
            And Bad_NodeIdUnknown for the non-existent starting node
            And Bad_NoMatch for the non-existent browsePath

          Validation is accomplished by comparing the returned NodeId against
          an expected NodeId stored in settings.

      Revision History:
          2009-09-20 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2010-03-22 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
*/

/*global addLog, BrowseDirection, BrowseToDepth, CreateQualifiedNamesArrayFromString, 
  ExpectedAndAcceptedResults, include, readSetting, safelyInvoke, StatusCode,
  TestTranslateBrowsePathsToNodeIdsMultiMix, UaNodeId, UaQualifiedName
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_mix.js" );

function Test573Err002()
{
    var goodStartingNodeSetting = "/Server Test/NodeIds/Paths/Starting Node 1";
    var goodStartingNodeId = UaNodeId.fromString( readSetting( goodStartingNodeSetting ).toString() );
    if( goodStartingNodeId === undefined || goodStartingNodeId === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '" + goodStartingNodeSetting + "'." );
        return;
    }
    var startingNodeSettings = [
        goodStartingNodeSetting,
        "/Advanced/NodeIds/Invalid/UnknownNodeId2",
        goodStartingNodeSetting,
        goodStartingNodeSetting
    ];
    var startingNodeIds = [
        UaNodeId.fromString( readSetting( startingNodeSettings[0] ).toString() ),
        UaNodeId.fromString( readSetting( startingNodeSettings[1] ).toString() ),
        UaNodeId.fromString( readSetting( startingNodeSettings[2] ).toString() ),
        UaNodeId.fromString( readSetting( startingNodeSettings[3] ).toString() )
    ];
    var pathsToBrowse = [
        BrowseToDepth( goodStartingNodeId, BrowseDirection.Forward, 10, [] ),
        BrowseToDepth( goodStartingNodeId, BrowseDirection.Forward, 1, [] ),
        BrowseToDepth( goodStartingNodeId, BrowseDirection.Forward, 4, [] ),
        BrowseToDepth( goodStartingNodeId, BrowseDirection.Forward, 1, [] )
    ];
    if( pathsToBrowse[0] === null || pathsToBrowse[1] === null || pathsToBrowse[2] === null || pathsToBrowse[3] === null )
    {
        addSkipped( "Unable to find a Browse Path for setting: " + goodStartingNodeSetting + ". Aborting TranslateBrowsePathToNodeIds test." );
    }
    else
    {
        pathsToBrowse[3].browseNames = CreateQualifiedNamesArrayFromString( "5:NoSuchNodeHere" );
        pathsToBrowse[0].targetNodeId = [ pathsToBrowse[0].targetNodeId ];
        pathsToBrowse[1].targetNodeId = [ ];
        pathsToBrowse[2].targetNodeId = [ pathsToBrowse[2].targetNodeId ];
        pathsToBrowse[3].targetNodeId = [ ];
    
        var expectedOperationResults = [
            new ExpectedAndAcceptedResults(),
            new ExpectedAndAcceptedResults(),
            new ExpectedAndAcceptedResults(),
            new ExpectedAndAcceptedResults()
        ];
        expectedOperationResults[0].addExpectedResult( StatusCode.Good );
        expectedOperationResults[1].addExpectedResult( StatusCode.BadNodeIdUnknown );
        expectedOperationResults[2].addExpectedResult( StatusCode.Good );
        expectedOperationResults[3].addExpectedResult( StatusCode.BadNoMatch );

        for( var i = 0; i < pathsToBrowse.length; i++ )
        {
            addLog( "BrowsePaths[" + i + "] will" );
            pathsToBrowse[i].addLog( startingNodeSettings[i], startingNodeIds[i] );
        }

        TestTranslateBrowsePathsToNodeIdsMultiMix( startingNodeIds, pathsToBrowse, expectedOperationResults );
    }
}

safelyInvoke( Test573Err002 );