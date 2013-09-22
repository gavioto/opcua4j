/*  CreateSession 5.6.1 Test Error 9. Prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Create 2 Sessions with default parameters, but use the same clientNonce 
        for both sessions.
        Expect error Bad_NonceInvalid for the 2nd session.

    Revision History:
        28-Sep-2009 NP: Initial version.
        23-Nov-2009 NP: REVIEWED.
        30-Nov-2010 NP: session2 uses default timeout from settings.
        29-Jun-2011 Matthias Lechner: If the second session cannot be created (as expected),
                    it must not be activated.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.6.1.
*/

include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/expectedResults.js" );

function createSession561Err009()
{
    if( !isChannelSecure( g_channel ) )
    {
        addSkipped( "Channel is not secure. Cannot perform test." );
        return;
    }

    var createSessionRequest1 = CreateDefaultCreateSessionRequest( g_session );
    var createSessionResponse1 = new UaCreateSessionResponse();

    uaStatus = g_session.createSession( createSessionRequest1, createSessionResponse1 );
    if(uaStatus.isGood())
    {
        activateSession( g_session );
        checkCreateSessionValidParameter( g_session, createSessionRequest1, createSessionResponse1 );

        // create session #2, using the same ClientNonce
        var createSessionRequest2 = CreateDefaultCreateSessionRequest( g_session );
        createSessionRequest2.ClientNonce = createSessionRequest1.ClientNonce;
        var createSessionResponse2 = new UaCreateSessionResponse();

        var g_session2 = new UaSession(g_channel);
        g_session2.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
        uaStatus = g_session2.createSession( createSessionRequest2, createSessionResponse2 );
        if ( uaStatus.isGood() )
        {
            var ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNonceInvalid );
            if( !checkCreateSessionFailed( createSessionRequest2, createSessionResponse2, ExpectedServiceResult ) )
            {
                activateSession( g_session2 );
                closeSession( g_session2 );
            }
        }
        else
        {
            addError( "CreateSession() status " + uaStatus, uaStatus );            
        }
        closeSession( g_session );
    }
    else
    {
        addError( "CreateSession() status " + uaStatus, uaStatus );
    }
}

safelyInvoke( createSession561Err009 );