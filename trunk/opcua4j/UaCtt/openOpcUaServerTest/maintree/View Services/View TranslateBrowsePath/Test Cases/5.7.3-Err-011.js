/*    Test 5.7.3-Err-11 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an existent starting node
            And multiple RelativePath elements
            And a RelativePath element has a ReferenceTypeId that does not match
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns operation result Bad_NoMatch.

      Revision History:
          2009-09-22 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2010-03-22 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
*/

/*global BrowseDirection, BrowseToDepth, ExpectedAndAcceptedResults, Identifier, include, readSetting,
  safelyInvoke, StatusCode, TestTranslateBrowsePathsToNodeIdsMultiMix, UaNodeId, UaQualifiedName
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_mix.js" );

// Change a ReferenceType NodeId to Organizes or HasProperty.
function SwapReferenceType( oldType )
{
    const organizesType   = new UaNodeId( Identifier.Organizes );  //UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Organizes" ).toString() );
    const hasPropertyType = new UaNodeId( Identifier.HasProperty );//UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/HasProperty" ).toString() );

    var newType;
    if( oldType.equals( organizesType ) )
    {
        newType = hasPropertyType;
    }
    else
    {
        newType = organizesType;
    }
    return newType;
}

function Test573Err011()
{
    // two tests: the last RelativePath has a non-matching ReferenceType,
    // and the second RelativePath has a non-matching ReferenceType

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
    var startingNodeIds = [];
    var pathsToBrowse = [];
    var expectedOperationResults = [];
    var i;
    var continueTest = true;
    for( i = 0; i < startingNodeSettings.length; i++ )
    {
        startingNodeIds[i] = UaNodeId.fromString( readSetting( startingNodeSettings[i] ).toString() );
        pathsToBrowse[i] = BrowseToDepth( startingNodeIds[i], BrowseDirection.Forward, 4, [] );
        if( pathsToBrowse[i] !== null )
        {
            pathsToBrowse[i].targetNodeId = [];
            expectedOperationResults[i] = new ExpectedAndAcceptedResults();
            expectedOperationResults[i].addExpectedResult( StatusCode.BadNoMatch ); 
        }
        else
        {
            addSkipped( "Could not obtain a Browse Path for the node configured in setting: " + startingNodeSettings[i] + ". Aborting test." );
            continueTest = false;
            break;
        }
    }
    if( continueTest )
    {
        pathsToBrowse[0].referenceTypeIds[3] = SwapReferenceType( pathsToBrowse[0].referenceTypeIds[3] );
        pathsToBrowse[1].referenceTypeIds[1] = SwapReferenceType( pathsToBrowse[1].referenceTypeIds[1] );

        TestTranslateBrowsePathsToNodeIdsMultiMix( startingNodeIds, pathsToBrowse, expectedOperationResults );
    }
}

safelyInvoke( Test573Err011 );