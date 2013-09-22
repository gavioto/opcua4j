/*    Test 5.7.2-Err-2 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given a node to browse
            And the node exists
            And the requestedMaxReferencesPerNode is 1
            And the node has at least two references
          When Browse is called
            And the session is disconnected
            And a new session is connected
            And BrowseNext is called
          Then the server returns operation result Bad_ContinuationPointInvalid.

      Revision History:
          2009-09-11 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2011-16-17 NP: Revised to temporarily close the CU-wide session and reinstate at the end. Makes for embedded-friendly script.
*/

/*global GetBrowseResponseForOneReference, AssertEqual, AssertFalse, 
  CreateDefaultBrowseNextRequest, UaBrowseNextResponse, ExpectedAndAcceptedResults,
  StatusCode, checkBrowseNextError, addError, UaChannel, UaSession, connect, disconnect,
  UaNodeId, readSetting, GetDefaultReferencesFromNodeId, Session
*/

// Return a browse response after browsing one node for
// one reference.
function Test572Err2BrowseOneNodeForOneReference( session, nodeToBrowse )
{
    var response = GetBrowseResponseForOneReference( session, [ nodeToBrowse ] );
    if( response == -1 )
    {
        return -1;
    }

    // a bit of validation
    if( !AssertEqual( 1, response.Results[0].References.length, "Test cannot be completed: browse returned wrong number of results." ) )
    {
        return -1;
    }
    if( !AssertFalse( response.Results[0].ContinuationPoint.isEmpty(), "Test cannot be completed: returned ContinuationPoint is empty." ) )
    {
        return -1;
    }
    return response;
}

// BrowseNext with a released continuationPoint.
function Test572Err2BrowseNextReleasedContinuationPoint( session, continuationPoint, returnDiagnostics )
{
    // browseNext
    var request = CreateDefaultBrowseNextRequest( session );
    var response = new UaBrowseNextResponse();
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
    request.ContinuationPoints[0] = continuationPoint;
    var uaStatus = session.browseNext( request, response );

    // check result
    if( uaStatus.isGood() )
    {
        var expectedOperationResultsArray = [1];
        expectedOperationResultsArray[0] = new ExpectedAndAcceptedResults();
        expectedOperationResultsArray[0].addExpectedResult( StatusCode.BadContinuationPointInvalid );
        checkBrowseNextError( request, response, expectedOperationResultsArray );
    }
    else
    {
        addError( "browseNext() failed", uaStatus );
    }
    return response;
}

// Create a new session, call a service (specified function)
// and disconnect. Returns a Browse or BrowseNext response
// (whatever the service function returns).
function ExecuteInNewSession( serviceFunction )
{
    // create a session
    var localChannel = new UaChannel();
    var localSession = new UaSession( localChannel );
    if( !connect( localChannel, localSession ) )
    {
        addError( "Test cannot be completed: could not create session." );
        return -1;
    }

    // function call
    var response = serviceFunction.apply( this, [ localSession ].concat( Array.prototype.slice.apply( arguments ).slice( 1 ) ) );

    // disconnect session
    disconnect( localChannel, localSession );

    return response;
}

function Test571015( )
{
    var nodeToBrowse = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has 3 Forward References 1" ).toString() );
    if( nodeToBrowse === undefined || nodeToBrowse === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '/Server Test/NodeIds/References/Has 3 Forward References 1'." );
        return;
    }
    var references = GetDefaultReferencesFromNodeId( Session, nodeToBrowse );
    if( references.length < 2 )
    {
        addError( "Test cannot be completed: node must have at least two references." );
        return;
    }

    // temporarily close the current CU-wide session - we will open it again at the end
    disconnect( Channel, Session );
    
    var firstResponse = ExecuteInNewSession( Test572Err2BrowseOneNodeForOneReference, nodeToBrowse );
    if( firstResponse === -1 )
    {
        return;
    }

    ExecuteInNewSession( Test572Err2BrowseNextReleasedContinuationPoint, firstResponse.Results[0].ContinuationPoint, 0 );
    ExecuteInNewSession( Test572Err2BrowseNextReleasedContinuationPoint, firstResponse.Results[0].ContinuationPoint, 0x3ff );

    // restore the existing session that we closed
    connect( Channel, Session );
}

safelyInvoke( Test571015 );