/*    Test 5.7.3-Err-1 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one invalid starting node
            And one relativePath element
            And the relativePath nodes exist
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns operation result Bad_NodeIdInvalid.

      Revision History:
          2009-09-18 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2010-03-22 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
*/

/*global addError, addLog, BrowseDirection, BrowseToDepth, checkTranslateBrowsePathsToNodeIdsError,
  CreateDefaultTranslateBrowsePathsToNodeIdsRequest, ExpectedAndAcceptedResults, include, 
  readSetting, safelyInvoke, Session, StatusCode, TestTranslateBrowsePathsToNodeIdsMultiMix,
  UaNodeId, UaQualifiedName, UaTranslateBrowsePathsToNodeIdsResponse
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_basic.js" );

// Test translate a NodeId of invalid syntax.
function TestTranslateOneInvalidSyntaxNodeId( invalidStartingNodeSetting, returnDiagnostics )
{
    var goodStartingNodeSetting = "/Server Test/NodeIds/Paths/Starting Node 1";
    var goodStartingNodeId = UaNodeId.fromString( readSetting( goodStartingNodeSetting ).toString() );
    if( goodStartingNodeId === undefined || goodStartingNodeId === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '" + goodStartingNodeSetting + "'." );
        return;
    }
    var pathToBrowse = BrowseToDepth( goodStartingNodeId, BrowseDirection.Forward, 1, [] );
    
    var invalidStartingNodeId = UaNodeId.fromString( readSetting( invalidStartingNodeSetting ).toString() );
    addLog( "Testing invalid starting node <" + invalidStartingNodeSetting +"> <" + invalidStartingNodeId + ">" );

    var request = CreateDefaultTranslateBrowsePathsToNodeIdsRequest( Session, [ invalidStartingNodeId ], [ pathToBrowse.browseNames ], [ pathToBrowse.referenceTypeIds ] );
    var response = new UaTranslateBrowsePathsToNodeIdsResponse();
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;

    var uaStatus = Session.translateBrowsePathsToNodeIds( request, response );

    // check result
    if( uaStatus.isGood() )
    {
        var expectedOperationResultsArray = [1];
        expectedOperationResultsArray[0] = new ExpectedAndAcceptedResults();
        expectedOperationResultsArray[0].addExpectedResult( StatusCode.BadNodeIdInvalid );
        expectedOperationResultsArray[0].addExpectedResult( StatusCode.BadNodeIdUnknown );
        
        checkTranslateBrowsePathsToNodeIdsError( request, response, expectedOperationResultsArray );
    }
    else
    {
        addError( "browse() failed: " + uaStatus );
    }
}

function translate573err001()
{
    var settings = NodeIdSettings.InvalidNodeIds();
    for( var s=0; s<settings.length; s++ )
    {
        TestTranslateOneInvalidSyntaxNodeId( settings[s], 0 );
    }
    for( var s=0; s<settings.length; s++ )
    {
        TestTranslateOneInvalidSyntaxNodeId( settings[s], 0x3ff );
    }
}

safelyInvoke( translate573err001 );