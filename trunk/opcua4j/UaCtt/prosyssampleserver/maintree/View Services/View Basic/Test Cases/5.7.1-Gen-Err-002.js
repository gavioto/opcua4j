/*    Test 5.7.1-Gen-Err-002 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given an empty/null authenticationToken
          When Browse is called
          Then the server returns service error Bad_SecurityChecksFailed

      Revision History
          2009-09-16 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
*/

/*global include, Session, checkBrowseFailed, UaNodeId, readSetting,
  GetDefaultBrowseRequest, addError, UaBrowseResponse, 
  TestNullAuthenticationToken
*/

include( "./library/ClassBased/UaRequestHeader/5.4-Err-002.js" );

function Test571GenErr002Browse( request, response )
{
    return Session.browse( request, response );
}

function Test571GenErr002Assert( request, response, expectedServiceResult )
{
    return checkBrowseFailed( request, response, expectedServiceResult );
}

function Test571GenErr002()
{
    var nodeToBrowse = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has 3 Forward References 1" ).toString() );
    if( nodeToBrowse === undefined || nodeToBrowse === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '/Server Test/NodeIds/References/Has 3 Forward References 1'." );
        return;
    }
    // setup a valid request
    var request = GetDefaultBrowseRequest( Session, nodeToBrowse );
    if( request == -1 )
    {
        addError( "Test cannot be completed" );
        return;
    }
    var response = new UaBrowseResponse();
    
    TestNullAuthenticationToken( Test571GenErr002Browse, Test571GenErr002Assert, request, response );
}

safelyInvoke( Test571GenErr002 );