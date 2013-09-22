/*  Test 5.6.2 Test 4 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        activate an already active session while specifying different user 
        login credentials.

    Revision History
        06-Oct-2008 NP: Initial version.
        23-Nov-2009 NP: REVIEWED/INCOMPLETE.
        26-Mar-2010 NP: Revised to use 'activateSession' object, but is still INCOMPLETE.
        28-Apr-2010 RTD: Using the 'activateSession' helper, which handles security.
*/

function activateSession562004()
{
    var policy = parseInt( readSetting( "/Server Test/Session/UserAuthenticationPolicy" ) );
    if ( policy == UserTokenType.Anonymous )
    {
        addNotSupported( "User impersonation (anonymous)" );
        return;
    }

    if( createSession( g_session ) )
    {
        if( activateSession( g_session ) )
        {
            // activate the session again with another user credential.
            var results = new ExpectedAndAcceptedResults( StatusCode.Good );
            results.addAcceptedResult( StatusCode.BadIdentityChangeNotSupported );
            activateSession( g_session, UserCredentials.createFromSettings( PresetCredentials.AccessGranted2 ), results, false);
        }
        closeSession( g_session );
    }
}

safelyInvoke( activateSession562004 );