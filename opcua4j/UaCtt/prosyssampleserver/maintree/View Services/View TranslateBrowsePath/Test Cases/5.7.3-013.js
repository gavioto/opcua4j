/*    Test 5.7.3-13 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given ten existent starting nodes
            And existent relativePath nodes
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns the NodeId of the last relativePath element for each starting node
          
          Validation is accomplished by comparing the returned NodeId against
          an expected NodeId stored in settings.

      Revision History
          2009-09-19 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
          2010-03-20 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
          2010-12-15 MI: added ToDos ( see mantis issue 1446)
          2010-12-16 NP: Added code to validate the settings before continuing with test.
                         Added code to validate a path was received, before trying to browse it.
*/

/*global addError, addLog, BrowseDirection, BrowseToDepth, GetDefaultReferencesFromNodeId, include, 
  readSetting, safelyInvoke, Session, TestTranslateBrowsePathsToNodeIdsMulti, UaNodeId
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_basic.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/get_references.js");

// Browse a node to get a BrowseName, ReferenceTypeId, and targetNodeId.
function AddToTranslateTestArrays( referenceIndex, browseIndex, startingNodeIds, browseNames, referenceTypeIds, targetNodeIds )
{
    var references = GetDefaultReferencesFromNodeId( Session, startingNodeIds[browseIndex] );
    if( references.length < 1 )
    {
        addError( "Test cannot be completed: node returned no references: " + startingNodeIds[browseIndex] );
        return;
    }
    referenceIndex = Math.round( ( references.length - 1) * referenceIndex );
    browseNames[browseIndex] = [ references[referenceIndex].BrowseName ];
    referenceTypeIds[browseIndex] = [ references[referenceIndex].ReferenceTypeId ];
    targetNodeIds[browseIndex] = [ references[referenceIndex].NodeId.NodeId ];
}

function Test573013()
{
    var i;
    var startingNodeSettings = [
        "/Server Test/NodeIds/Paths/Starting Node 1",
        "/Server Test/NodeIds/Paths/Starting Node 1",
        "/Server Test/NodeIds/Paths/Starting Node 1",
        "/Server Test/NodeIds/References/Has 3 Forward References 1",
        "/Server Test/NodeIds/References/Has 3 Forward References 1",
        "/Server Test/NodeIds/References/Has 3 Forward References 1",
        "/Server Test/NodeIds/References/Has 3 Forward References 2",
        "/Server Test/NodeIds/References/Has 3 Forward References 3",
        "/Server Test/NodeIds/References/Has 3 Forward References 4",
        "/Server Test/NodeIds/References/Has 3 Forward References 5"
    ];
    
    // Check if the nodeIds are configured in the settings
    var settingsAreGood = false;
    if( AssertSettingGood( startingNodeSettings[0], "Require a starting node for this test." ) )
    {
        for( var i=5; i<startingNodeSettings.length; i++ )
        {
            settingsAreGood = AssertSettingGood( startingNodeSettings[i], "Require a node with 3 forward references." );
            if( !settingsAreGood )
            {
                settingsAreGood = false;
                break;
            }
        }
    }

    if( !settingsAreGood )
    {
        addSkipped( "Test skipped because there are nodes required that are not configured in the settings. Review the log for more details." );
        return;
    }

    var startingNodeIds = [];
    for( i = 0; i < startingNodeSettings.length; i++ )
    {
        startingNodeIds[i] = UaNodeId.fromString( readSetting( startingNodeSettings[i] ).toString() );
    }
    
    var browseDepth = [1, 4, 10, 1, 2, 3, 4, 3, 2, 1];
    
    // use Browse to find browseNames, referenceTypeIds, and targetNodes
    var pathsToBrowse = [];
    for( i = 0; i < startingNodeSettings.length; i++)
    {
        // generate error and stop this test if BrowseToDepth does not return a valid path
        // otherwise we get a script exception in the "for-loop" below
        var path = BrowseToDepth( startingNodeIds[i], BrowseDirection.Forward, browseDepth[i], [] );
        // did BrowseToDepth return a null? if so then log an error and abort this script (gracefully)
        if( path === null )
        {
            addError( "Unable to find a browsePath on nodeId: " + startingNodeIds[i] + "; BrowseDirection.Forward. Aborting test." );
            break;
        }
        pathsToBrowse[i] = path;
    }

    // if the pathsToBrowse were successful, then continue the test
    if( pathsToBrowse.length === startingNodeSettings.length )
    {
        var browseNames = [];
        var referenceTypeIds = [];
        var targetNodeIds = [];
        for( i = 0; i < pathsToBrowse.length; i++ )
        {
            browseNames[i] = pathsToBrowse[i].browseNames;
            referenceTypeIds[i] = pathsToBrowse[i].referenceTypeIds;
            targetNodeIds[i] = [ pathsToBrowse[i].targetNodeId ];

            addLog( "BrowsePaths[" + i + "] will" );
            pathsToBrowse[i].addLog( startingNodeSettings[i], startingNodeIds[i] );
        }

        TestTranslateBrowsePathsToNodeIdsMulti( startingNodeIds, browseNames, referenceTypeIds, targetNodeIds );
    }
}

safelyInvoke( Test573013 );