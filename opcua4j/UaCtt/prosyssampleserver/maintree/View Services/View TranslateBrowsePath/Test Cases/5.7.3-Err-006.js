/*    Test 5.7.3-Err-6 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an existent starting node
            And one non-existent BrowseName
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns operation result Bad_NoMatch.

      Revision History:
          2009-09-21 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2010-03-22 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
*/

/*global BrowseDirection, BrowseToDepth, CreateQualifiedNamesArrayFromString, 
  ExpectedAndAcceptedResults, include, readSetting, safelyInvoke, StatusCode,
  TestTranslateBrowsePathsToNodeIdsMultiMix, UaNodeId, UaQualifiedName
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_mix.js" );

function Test573Err006()
{
    var startingNodeSettings = [
        "/Server Test/NodeIds/Paths/Starting Node 1",
        "/Server Test/NodeIds/Paths/Starting Node 1"
    ];
    var settingValue = readSetting( startingNodeSettings[0] ).toString();
    if( settingValue === undefined || settingValue === null || settingValue === "" )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '" + startingNodeSettings[0] + "'." );
        return;
    }
    var i;
    var startingNodeIds = [];
    var pathsToBrowse = [];
    var expectedOperationResults = [];
    for( i = 0; i < startingNodeSettings.length; i++ )
    {
        startingNodeIds[i] = UaNodeId.fromString( readSetting( startingNodeSettings[i] ).toString() );
        pathsToBrowse[i] = BrowseToDepth( startingNodeIds[i], BrowseDirection.Forward, 1, [] );
        pathsToBrowse[i].targetNodeId = [ ];
        expectedOperationResults[i] = new ExpectedAndAcceptedResults();
        expectedOperationResults[i].addExpectedResult( StatusCode.BadNoMatch );
    }

    pathsToBrowse[0].browseNames = CreateQualifiedNamesArrayFromString( "0:NoSuchNodeHere" );
    pathsToBrowse[1].browseNames = CreateQualifiedNamesArrayFromString( readSetting( "/Server Test/NodeIds/Paths/Unknown Path 1" ).toString() );

    TestTranslateBrowsePathsToNodeIdsMultiMix( startingNodeIds, pathsToBrowse, expectedOperationResults );
}

Test573Err006();