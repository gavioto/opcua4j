/*    Test 5.7.3-Err-5 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an existent starting node
            And no RelativePath elements
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns operation result Bad_NothingToDo.
          According to Part 4 table 38, if the relativePath is empty then Bad_NothingToDo is returned.

      Revision History:
        2009-09-21 Dale Pope: Initial version.
        2009-11-30 NP: REVIEWED.
        2010-03-22 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
        2010-12-16 MI: Corrected expected result. Expects Bad_NothingToDo, not Bad_NoMatch.
*/

/*global BrowseDirection, BrowsePathInfo, BrowseToDepth, ExpectedAndAcceptedResults, include,
  readSetting, safelyInvoke, StatusCode, TestTranslateBrowsePathsToNodeIdsMultiMix, UaNodeId,
  UaQualifiedName
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_mix.js" );

function Test573Err005()
{
    var startingNodeSetting = "/Server Test/NodeIds/Paths/Starting Node 1";
    var startingNodeIds = [
        UaNodeId.fromString( readSetting( startingNodeSetting ).toString() )
    ];
    if( startingNodeIds === undefined || startingNodeIds === null || startingNodeIds[0] === null || startingNodeIds[0] === undefined )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '" + startingNodeSetting + "'." );
        return;
    }
    var pathsToBrowse = [ new BrowsePathInfo() ];
    pathsToBrowse[0].targetNodeId = [ ];
    
    var expectedOperationResults = [
        new ExpectedAndAcceptedResults()
    ];
    expectedOperationResults[0].addExpectedResult( StatusCode.BadNothingToDo );

    TestTranslateBrowsePathsToNodeIdsMultiMix( startingNodeIds, pathsToBrowse, expectedOperationResults );
}

Test573Err005();