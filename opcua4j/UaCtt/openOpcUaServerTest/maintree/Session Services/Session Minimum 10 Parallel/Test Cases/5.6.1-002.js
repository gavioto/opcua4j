/*  Prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Creates 10 concurrent sessions.

    Revision History
        28-Aug-2009 NP: Initial version.
        23-Nov-2009 NP: REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.6.1.
*/

include( "./library/Base/safeInvoke.js" );
include( "./library/ServiceBased/SessionServiceSet/CreateSession/minimum_parallel_sessions.js" );

function createSession561002()
{
    // the max Count of sessions
    var g_sessionCount = 10;

    // Connect to the server 
    var g_sessions = []

    // create our sessions
    var timeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ).toString() );
    for( var i=0; i<g_sessionCount; i++ )
    {
        g_sessions[i] = new UaSession( g_channel );
        g_sessions[i].DefaultTimeoutHint = timeoutHint;
    }

    // common routine for testing multiple sessions
    MinimumParallelSessions( g_sessions, g_sessionCount );

    // close the sessions
    if( g_sessions !== null && g_sessions.length > 0 )
    {
        for( var i=0; i<g_sessionCount; i++ )
        {
            if( g_sessions[i] !== null && g_sessions[i].Connected !== undefined )
            {
                addLog( "Closing session #" + (1+i) + "; SessionId: " + g_sessions[i].SessionId );
                closeSession( g_sessions[i] );
            }
        }
    }

    // clean-up
    g_sessions = null;
}

safelyInvoke( createSession561002 );