/*    Test 5.7.2-Gen-Err-003 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given a non-existent authenticationToken
          When Browse is called
          Then the server returns service error Bad_SecurityChecksFailed.

      Revision History:
          2009-09-16 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
*/

/*global include, Session, checkBrowseNextFailed, UaNodeId, readSetting,
  CreateDefaultBrowseNextRequest, addError, UaBrowseNextResponse, 
  TestNonexistentAuthenticationToken, GetBrowseResponseForOneReference
*/

include( "./library/ClassBased/UaRequestHeader/5.4-Err-003.js" );

function Test572GenErr003Browse( request, response )
{
    return Session.browseNext( request, response );
}

function Test572GenErr003Assert( request, response, expectedServiceResult )
{
    return checkBrowseNextFailed( request, response, expectedServiceResult );
}

function Test572GenErr003()
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

    TestNonexistentAuthenticationToken( Test572GenErr003Browse, Test572GenErr003Assert, request, response );

    // clean-up any continuationPoints
    releaseContinuationPoints( Session, response );
}

safelyInvoke( Test572GenErr003 );