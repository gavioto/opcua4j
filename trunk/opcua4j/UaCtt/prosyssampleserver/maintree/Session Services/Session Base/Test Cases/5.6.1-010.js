/*  Prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Invoke CreateSession specifying a RequestedSessionTimeout of 0.
        We expect the RevisedSessionTimeout != 0.

    Revision History:
        21-Oct-2009 NP: Initial version.
        23-Nov-2009 NP: REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.6.1.
*/

include( "./library/Base/safeInvoke.js" );

function createSession561010()
{
    const ZEROTIMEOUT = 0;

    var createSessionRequest = CreateDefaultCreateSessionRequest( g_session );
    var createSessionResponse = new UaCreateSessionResponse();    

    createSessionRequest.RequestedSessionTimeout = ZEROTIMEOUT;

    uaStatus = g_session.createSession( createSessionRequest, createSessionResponse );
    if( uaStatus.isGood() )
    {
        if( activateSession( g_session ) )
        {
            if( checkCreateSessionValidParameter( g_session, createSessionRequest, createSessionResponse ) )
            {
                print( "\tRequested session timeout: " + createSessionRequest.RequestedSessionTimeout );
                print( "\tRevised session timeout: "   + createSessionResponse.RevisedSessionTimeout );
                AssertNotEqual( ZEROTIMEOUT, createSessionResponse.RevisedSessionTimeout );
                closeSession( g_session );
            }
        }
    }
    else
    {
        addError( "CreateSession() status " + uaStatus, uaStatus );
    }
}

safelyInvoke( createSession561010 );