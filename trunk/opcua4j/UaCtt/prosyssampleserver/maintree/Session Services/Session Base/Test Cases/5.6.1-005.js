/*  CreateSession 5.6.1 Test 5, Prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        CreateSession with default parameters, except for a small timeout of 10 seconds.
        Activate the session and stall (do not use) the session for a period GREATER 
        than the timeout period. 
        Call any service on the session to experience a Bad_SessionClosed status.

    Revision History:
        28-Sep-2009 NP: Initial version.
        19-Nov-2009 UJ: REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.6.1.
*/

include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/ServiceBased/SessionServiceSet/ActivateSession/check_activateSession_failed.js" );

function createSession561005()
{
    const TIMEOUTDIVISION = 5;

    var createSessionRequest = CreateDefaultCreateSessionRequest( g_session );
    var createSessionResponse = new UaCreateSessionResponse();

    // override the default timeout value with our one, and then create the session.
    createSessionRequest.RequestedSessionTimeout = 10000;    
    var uaStatus = g_session.createSession( createSessionRequest, createSessionResponse );
    if( uaStatus.isGood() )
    {
        if( activateSession( g_session ) )
        {
            checkCreateSessionValidParameter( g_session, createSessionRequest, createSessionResponse );
        }

        if( createSessionResponse.RevisedSessionTimeout <= 0 )
        {
            addWarning( "Server returned a RevisedSessionTimeout of " + createSessionResponse.RevisedSessionTimeout );
        }

        // ok, so all is well... lets record the revisedSessionTimeout and we'll use
        // that to base our delay/wait on so as to cause a session timeout.
        var revisedTimeoutInMsec = createSessionResponse.RevisedSessionTimeout;
        var revisedTimeoutDiv = revisedTimeoutInMsec / TIMEOUTDIVISION;

        addLog( "About to stall the session. Session timeout currently at: " + revisedTimeoutInMsec + ". We're going to double it." );
        // we'll divide this timeout by TIMEOUTDIVISION and loop 2 * TIMEOUTDIVISION times to cause this delay each time
        // adding a message...
        for( var i = 0; i < ( 2 * TIMEOUTDIVISION ); i++ )
        {
            addLog( "Waiting '" + revisedTimeoutDiv + " msecs'. Iteration " +
            (1 + i) + " of " + ( 2 * TIMEOUTDIVISION ) );
            wait( revisedTimeoutDiv );
        }
    }
    else
    {
        addError( "CreateSession() status " + uaStatus, uaStatus );
    }

    var activateSessionRequest = new UaActivateSessionRequest();
    var activateSessionResponse = new UaActivateSessionResponse();
    g_session.buildRequestHeader( activateSessionRequest.RequestHeader );

    uaStatus = g_session.activateSession( activateSessionRequest, activateSessionResponse );
    if( uaStatus.isGood() )
    {
        var expectedResults = new ExpectedAndAcceptedResults( StatusCode.BadSessionIdInvalid );
        expectedResults.addExpectedResult( StatusCode.BadSessionClosed );
        checkActivateSessionFailed( activateSessionRequest, activateSessionResponse, expectedResults );
    }
    else
    {
        addError( "ActivateSession() status " + uaStatus, uaStatus );
    }
}

safelyInvoke( createSession561005 );