/*    Test 5.4-Err-2 applied to TranslateBrowsePathsToNodeIds (5.7.3) 
        prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an empty/null authenticationToken
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns service error Bad_SecurityChecksFailed.

      Revision History:
          2009-09-16 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2010-03-23 DP: Removed references to path settings. Test now determines the 
                         browse path by browsing recursively for a path that should work.
*/

/*global addError, BrowseDirection, BrowseToDepth, checkTranslateBrowsePathsToNodeIdsFailed,
  CreateDefaultTranslateBrowsePathsToNodeIdsRequest, include, readSetting, Session, 
  TestNullAuthenticationToken, UaNodeId, UaTranslateBrowsePathsToNodeIdsResponse
*/

include( "./library/ClassBased/UaRequestHeader/5.4-Err-002.js" );

function Test573GenErr002Translate( request, response )
{
    return Session.translateBrowsePathsToNodeIds( request, response );
}

function Test573GenErr002Assert( request, response, expectedServiceResult )
{
    return checkTranslateBrowsePathsToNodeIdsFailed( request, response, expectedServiceResult );
}

function Test573GenErr002()
{
    var startingNodeSetting = "/Server Test/NodeIds/Paths/Starting Node 1";
    var startingNodeId = UaNodeId.fromString( readSetting( startingNodeSetting ).toString() );
    if( startingNodeId === undefined || startingNodeId === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '" + startingNodeSetting + "'." );
        return;
    }
    var pathToBrowse = BrowseToDepth( startingNodeId, BrowseDirection.Forward, 1, [] );

    // setup a valid request
    var request = CreateDefaultTranslateBrowsePathsToNodeIdsRequest( Session, [ startingNodeId ], [ pathToBrowse.browseNames ], [ pathToBrowse.referenceTypeIds ] );
    if( request == -1 )
    {
        addError( "Test cannot be completed" );
        return;
    }
    var response = new UaTranslateBrowsePathsToNodeIdsResponse();

    TestNullAuthenticationToken( Test573GenErr002Translate, Test573GenErr002Assert, request, response );
}

Test573GenErr002();
