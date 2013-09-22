/*  Prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Invoke CreateSession with default parameters.
        Do this for 5 sessions, which will cause the session name to be the same 
        for each session.

    Revision History
        28-Sep-2009 NP: Initial version.
        19-Nov-2009 UJ: REVIEWED.
        04-Dec-2009 DP: Added check that the requested SessionName is the same as
                        the session node's BrowseName.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.6.1.
*/

include( "./library/Base/safeInvoke.js" );

function createSession561006()
{
    const NUMBEROFSESSIONS = 5;
    
    var createSessionRequest = [];
    var createSessionResponse = [];
    var sessionObject = [];
    
    // CREATE OUR SESSIONS
    for( var i=0; i<NUMBEROFSESSIONS; i++ )
    {
        sessionObject[i] = new UaSession( g_channel );
        
        sessionObject[i].DefaultTimeoutHint = readSetting( "/Ua Settings/Session/DefaultTimeoutHint" );

        createSessionRequest[i] = CreateDefaultCreateSessionRequest( sessionObject[i] );
        createSessionResponse[i] = new UaCreateSessionResponse();
        
        createSessionRequest[i].SessionName = "SessionNameAlwaysTheSame";        
        
        addLog( "\nCreating session #" + (1 + i) + " of #" + NUMBEROFSESSIONS );
        var uaStatus = sessionObject[i].createSession( createSessionRequest[i], createSessionResponse[i] );
        
        // check result
        if( uaStatus.isGood() )
        {
            activateSession( sessionObject[i] );
            checkCreateSessionValidParameter( sessionObject[i], createSessionRequest[i], createSessionResponse[i] );
        }
        else
        {
            addError( "CreateSession() status " + uaStatus, uaStatus );
        }
    }// for i
    
    // REMOVE OUR SESSIONS
    for( i=0; i<NUMBEROFSESSIONS; i++ )
    {
        addLog( "Removing session #" + (1 + i ) );
        closeSession( sessionObject[i] );
    }// for i

    // clean-up
    sessionObject = null;
    createSessionResponse = null;
    createSessionRequest = null;
}

safelyInvoke( createSession561006 );