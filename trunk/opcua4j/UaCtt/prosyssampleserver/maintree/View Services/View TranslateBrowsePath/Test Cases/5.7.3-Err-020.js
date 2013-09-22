/*    Test 5.7.3-Err-20 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an existent starting node
            And a RelativePath element
            And a RelativePath element has IncludeSubtypes = false
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns operation result Good.

          A ReferenceTypeId set to a null NodeId is expected to be treated as 
          equivalent to the References base-type NodeId.

      Revision History:
          2010-05-05 Dale Pope: Initial version.
          2010-12-17 NP: Revised expectations: 
                          (1) Operation result becomes GOOD (was Bad_NoMatch).
                          (2) Received results contain all references (was empty).
*/

/*global BrowseDirection, BrowseToDepth, ExpectedAndAcceptedResults, include, readSetting, safelyInvoke,
  StatusCode, TestTranslateBrowsePathsToNodeIdsInverseMultiMix, UaNodeId, UaQualifiedName
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_mix.js" );

function Test573Err020()
{
    /* test null NodeIds:
        Numeric   identifier = 0
        String    identifier = empty string
        String    identifier = null string
        Guid      identifier = guid with all fields = 0
        Opaque    identifier = bytestring with length = 0
    */
    
    var nullNodeIds = [
        UaNodeId.fromString( "ns=0;i=0" ),
        UaNodeId.fromString( "ns=0;s=" ),
        UaNodeId.fromString( "ns=0;s=" + String.fromCharCode(0) ),
        UaNodeId.fromString( "ns=0;g={00000000-0000-0000-0000-000000000000}" ),
        UaNodeId.fromString( "ns=0;b=" )
    ];

    var startingNodeSetting = "/Server Test/NodeIds/Paths/Starting Node 1";
    var startingNodeId = UaNodeId.fromString( readSetting( startingNodeSetting ).toString() );
    if( startingNodeId === undefined || startingNodeId === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '" + startingNodeSetting + "'." );
        return;
    }
    var pathToBrowse = BrowseToDepth( startingNodeId, BrowseDirection.Forward, 1, [] );
    var startingNodeIds = [];
    var pathsToBrowse = [];
    var expectedOperationResults = [];
    var i;
    for( i = 0; i < nullNodeIds.length; i++ )
    {
        startingNodeIds[i] = startingNodeId;
        pathsToBrowse[i] = new BrowsePathInfo();
        pathsToBrowse[i].browseNames = pathToBrowse.browseNames;
        pathsToBrowse[i].referenceTypeIds[0] = nullNodeIds[i];
        pathsToBrowse[i].targetNodeId = [pathToBrowse.targetNodeId];
        expectedOperationResults[i] = new ExpectedAndAcceptedResults();
        expectedOperationResults[i].addExpectedResult( StatusCode.Good ); 
    }

    TestTranslateBrowsePathsToNodeIdsMultiMix( startingNodeIds, pathsToBrowse, expectedOperationResults, true );
}

safelyInvoke( Test573Err020 );