/*    Test 5.7.2-Gen-Err-002 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an empty/null authenticationToken
          When BrowseNext is called
          Then the server returns service error Bad_SecurityChecksFailed.

      Revision History:
          2009-09-16 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
*/

/*global include, Session, checkBrowseNextFailed, UaNodeId, readSetting,
  CreateDefaultBrowseNextRequest, addError, GetBrowseResponseForOneReference,
  UaBrowseNextResponse, TestNullAuthenticationToken
*/

include( "./library/ClassBased/UaRequestHeader/5.4-Err-002.js" );

function Test572GenErr002BrowseNext( request, response )
{
    return Session.browseNext( request, response );
}

function Test572GenErr002Assert( request, response, expectedServiceResult )
{
    return checkBrowseNextFailed( request, response, expectedServiceResult );
}

function Test572GenErr002()
{
    var nodeToBrowse = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has 3 Forward References 1" ).toString() );
    if( nodeToBrowse === undefined || nodeToBrowse === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting 'Server Test/NodeIds/References/Has 3 Forward References 1.'" );
        return;
    }

    var firstResponse = GetBrowseResponseForOneReference( Session, [ nodeToBrowse ] );
    if( firstResponse === -1 )
    {
        return;
    }

    // setup a valid request
    var request = CreateDefaultBrowseNextRequest( Session );
    if( request == -1 )
    {
        addError( "Test cannot be completed" );
        return;
    }
    request.ContinuationPoints[0] = firstResponse.Results[0].ContinuationPoint;
    var response = new UaBrowseNextResponse();

    TestNullAuthenticationToken( Test572GenErr002BrowseNext, Test572GenErr002Assert, request, response );

    // clean-up any continuationPoints
    releaseContinuationPoints( Session, response );
}

safelyInvoke( Test572GenErr002 );