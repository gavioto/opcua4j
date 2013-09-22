/*  Test 5.6.2 Test 4 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        activate a session using login credentials that do not have
        access to the UA Server.

    Revision History
        07-Oct-2008 NP: Initial version.
        24-Nov-2009 NP: REVIEWED/INCOMPLETE.
        26-Mar-2010 NP: Revised to use some script-library objects.
                        Added a check if secure channel, then apply security.
                        STILL INCOMPLETE.
        28-Apr-2010 RTD: Using the 'activateSession' helper, which handles security.                        
*/

include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/expectedResults.js" );

function activateSession562004()
{
    var policy = parseInt( readSetting( "/Server Test/Session/UserAuthenticationPolicy" ) );
    if ( policy == UserTokenType.Anonymous )
    {
        addSkipped( "The testing of 'Access Denied' is not possible because the CTT configuration is currently setup to use anonymous authentication." );
        return;
    }
    
    if( createSession( g_session ) )
    {
        var expectedResult = new ExpectedAndAcceptedResults( StatusCode.BadUserAccessDenied );
        activateSession( g_session, UserCredentials.createFromSettings( PresetCredentials.AccessDenied ), expectedResult, false );
        // not using the closeSession() helper here because the status from the call is not
        // important enough to cause an "addError".
        var request = new UaCloseSessionRequest();
        var response = new UaCloseSessionResponse();
        g_session.buildRequestHeader( request.RequestHeader );
        g_session.closeSession( request, response );
    }    
}

safelyInvoke( activateSession562004 );