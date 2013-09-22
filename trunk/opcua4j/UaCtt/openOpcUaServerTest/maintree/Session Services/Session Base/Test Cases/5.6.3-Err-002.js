/*  Test 5.6.3 Error test case #2 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Close a session that was never created! Expect 'BadSessionIdInvalid'.

    Revision History
        07-Oct-2009 NP: Initial version.
        24-Nov-2009 NP: REVIEWED.
        30-Nov-2010 NP: Set session timeout to use value from settings.
        24-May-2011 NP: Allow Bad_SessionClosed return as a Warning. Some servers stack may not provide such granular control over specific error codes.
*/

function closeSession563Err002()
{
    // call closeSession, which should fail!
    var closeSessionRequest = new UaCloseSessionRequest();
    var closeSessionResponse = new UaCloseSessionResponse();    

    // create a session object.
    var session = new UaSession( g_channel );
    session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
    session.buildRequestHeader( closeSessionRequest.RequestHeader );

    var uaStatus = session.closeSession( closeSessionRequest, closeSessionResponse );

    var expectedResults = new ExpectedAndAcceptedResults( StatusCode.BadSessionIdInvalid );
    expectedResults.addAcceptedResult( StatusCode.BadSessionClosed );
    checkCloseSessionFailed( closeSessionRequest, closeSessionResponse, expectedResults );

    // clean-up
    expectedResults = null;
    uaStatus = null;
    session = null;
    closeSessionResponse = null;
    closeSessionRequest = null;
}

safelyInvoke( closeSession563Err002 );