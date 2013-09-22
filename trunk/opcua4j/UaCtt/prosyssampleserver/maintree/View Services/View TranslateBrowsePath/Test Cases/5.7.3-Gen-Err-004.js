/*    Test 5.4-Err-4 applied to TranslateBrowsePathsToNodeIds (5.7.3) 
        prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given a RequestHeader.Timestamp of 0
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns service error Bad_InvalidTimestamp.

      Revision History:
          2009-09-28 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2010-03-23 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
*/

/*global addError, BrowseDirection, BrowseToDepth, checkTranslateBrowsePathsToNodeIdsFailed,
  CreateDefaultTranslateBrowsePathsToNodeIdsRequest, include, readSetting, safelyInvoke, 
  Session, TestInvalidRequestHeaderTimestamp, UaNodeId, UaTranslateBrowsePathsToNodeIdsResponse
*/

include( "./library/ClassBased/UaRequestHeader/5.4-Err-004.js" );

function Test573GenErr004TranslateBrowsePathsToNodeIds( request, response )
{
    return Session.translateBrowsePathsToNodeIds( request, response );
}

function Test573GenErr004Assert( request, response, expectedServiceResult )
{
    return checkTranslateBrowsePathsToNodeIdsFailed( request, response, expectedServiceResult );
}

function Test573GenErr004()
{
    var startingNodeSetting = "/Server Test/NodeIds/Paths/Starting Node 1";
    var startingNodeId = UaNodeId.fromString( readSetting( startingNodeSetting ).toString() );
    if( startingNodeId === undefined || startingNodeId === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '" + startingNodeSetting + "'." );
        return;
    }
    var pathToBrowse = BrowseToDepth( startingNodeId, BrowseDirection.Forward, 1, [] );
    
    var request = CreateDefaultTranslateBrowsePathsToNodeIdsRequest( Session, [ startingNodeId ], [ pathToBrowse.browseNames ], [ pathToBrowse.referenceTypeIds ] );
    if( request == -1 )
    {
        addError( "Test cannot be completed" );
        return;
    }
    var response = new UaTranslateBrowsePathsToNodeIdsResponse();

    TestInvalidRequestHeaderTimestamp( Test573GenErr004TranslateBrowsePathsToNodeIds, Test573GenErr004Assert, request, response );
}

safelyInvoke( Test573GenErr004 );