/*    Test 5.7.3-Err-18 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an existent starting node
            And multiple RelativePath elements
            And a RelativePath element has a ReferenceTypeId set to a NodeId of a Variable node
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns operation result Bad_NoMatch.

      Revision History:
          2009-09-28 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2010-03-22 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
*/

/*global BrowseDirection, BrowseToDepth, ExpectedAndAcceptedResults, include, readSetting, safelyInvoke,
  StatusCode, TestTranslateBrowsePathsToNodeIdsMultiMix, UaNodeId, UaQualifiedName
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_mix.js" );

function Test573Err018()
{
    // two tests: the last RelativePath has an invalid ReferenceType,
    // and the second RelativePath has an invalid ReferenceType
    // plus three tests: one for each invalid syntax NodeId setting

    var startingNodeSettings = [
        "/Server Test/NodeIds/Paths/Starting Node 1",
        "/Server Test/NodeIds/Paths/Starting Node 1",
        "/Server Test/NodeIds/Paths/Starting Node 1"
    ];
    var settingValue = readSetting( startingNodeSettings[0] ).toString();
    if( settingValue === undefined || settingValue === null || settingValue === "" )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '" + startingNodeSettings[0] + "'." );
        return;
    }
    var startingNodeIds = [];
    var pathsToBrowse = [];
    var expectedOperationResults = [];
    var i;
    var continueTest = true;
    for( i = 0; i < startingNodeSettings.length; i++ )
    {
        startingNodeIds[i] = UaNodeId.fromString( readSetting( startingNodeSettings[i] ).toString() );
        pathsToBrowse[i] = BrowseToDepth( startingNodeIds[i], BrowseDirection.Forward, 4, [] );
        if( pathsToBrowse[i] === null )
        {
            addSkipped( "Unable to obtain a Browse Path for setting: " + startingNodeSettings[0] + ". Skipping TranslateBrowsePathToNodeIds test." );
            continueTest = false;
            break;
        }
        pathsToBrowse[i].targetNodeId = [];
        expectedOperationResults[i] = new ExpectedAndAcceptedResults();
        expectedOperationResults[i].addExpectedResult( StatusCode.BadNoMatch ); 
    }
    if( continueTest )
    {
        pathsToBrowse[0].referenceTypeIds[3] = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/Variable" ).toString() );
        pathsToBrowse[1].referenceTypeIds[0] = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/Variable" ).toString() );
        pathsToBrowse[2].referenceTypeIds[2] = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/Variable" ).toString() );

        TestTranslateBrowsePathsToNodeIdsMultiMix( startingNodeIds, pathsToBrowse, expectedOperationResults, true );
    }
}

safelyInvoke( Test573Err018 );