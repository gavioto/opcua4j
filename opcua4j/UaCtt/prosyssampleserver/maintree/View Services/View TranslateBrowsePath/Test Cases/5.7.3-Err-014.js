/*    Test 5.7.3-Err-14 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an existent starting node
            And multiple RelativePath elements
            And a RelativePath element has a BrowseName that is invalid
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns operation result Bad_BrowseNameInvalid or Bad_NoMatch.

      Revision History:
          2009-09-23 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2010-03-22 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
*/

/*global BrowseDirection, BrowseToDepth, CreateQualifiedName, ExpectedAndAcceptedResults, 
  include, readSetting, safelyInvoke, StatusCode, TestTranslateBrowsePathsToNodeIdsMultiMix,
  UaNodeId, UaQualifiedName
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_mix.js" );

function Test573Err014()
{
    // two tests: the last RelativePath has a non-matching ReferenceType,
    // and the second RelativePath has a non-matching ReferenceType

    // create a long string
    var longString = "";
    var charCode;
    var i;
    for( i = 0; i < 600; i++ )
    {
        charCode = ( i % 0xDE ) + 0x21;
        if( charCode > 0x7E )
        {
            charCode += ( 0xA0 - 0x7F );
        }
        longString += String.fromCharCode( charCode );
    }

    // create string with "banned" characters
    var badCharString = "";
    for( i = 1; i <= 127; i++ )
    {
        badCharString += String.fromCharCode( i );
    }

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
    var continueTest = true;
    for( i = 0; i < startingNodeSettings.length; i++ )
    {
        startingNodeIds[i] = UaNodeId.fromString( readSetting( startingNodeSettings[i] ).toString() );
        pathsToBrowse[i] = BrowseToDepth( startingNodeIds[i], BrowseDirection.Forward, 4, [] );
        if( pathsToBrowse[i] !== null )
        {
            pathsToBrowse[i].targetNodeId = [];
            expectedOperationResults[i] = new ExpectedAndAcceptedResults();
            expectedOperationResults[i].addExpectedResult( StatusCode.BadBrowseNameInvalid );
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
        pathsToBrowse[0].browseNames[3] = CreateQualifiedName( pathsToBrowse[0].browseNames[3].NamespaceIndex, longString );
        pathsToBrowse[1].browseNames[3] = CreateQualifiedName( pathsToBrowse[1].browseNames[3].NamespaceIndex, badCharString );

        TestTranslateBrowsePathsToNodeIdsMultiMix( startingNodeIds, pathsToBrowse, expectedOperationResults );
    }
}

safelyInvoke( Test573Err014 );