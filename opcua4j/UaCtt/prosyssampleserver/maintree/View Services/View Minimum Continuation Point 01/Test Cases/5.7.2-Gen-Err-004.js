/*    Test 5.7.2-Gen-Err-004 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given a RequestHeader.Timestamp of 0
          When BrowseNext is called
          Then the server returns service error Bad_InvalidTimestamp.

      Revision History:
          2009-09-16 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
*/

/*global include, Session, checkBrowseNextFailed, UaNodeId, readSetting,
  CreateDefaultBrowseNextRequest, addError, UaBrowseNextResponse, 
  TestInvalidRequestHeaderTimestamp, GetBrowseResponseForOneReference
*/

include( "./library/ClassBased/UaRequestHeader/5.4-Err-004.js" );

function Test572GenErr004BrowseNext( request, response )
{
    return Session.browseNext( request, response );
}

function Test572GenErr004Assert( request, response, expectedServiceResult )
{
    return checkBrowseNextFailed( request, response, expectedServiceResult );
}

function Test572GenErr004()
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

    TestInvalidRequestHeaderTimestamp( Test572GenErr004BrowseNext, Test572GenErr004Assert, request, response );
}

safelyInvoke( Test572GenErr004 );