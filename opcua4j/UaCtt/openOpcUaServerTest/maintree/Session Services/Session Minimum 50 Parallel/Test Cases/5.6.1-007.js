/*  Prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Creates 50 concurrent unnamed session.

    Revision History:
        28-Sep-2009 NP: Initial version.
        23-Nov-2009 NP: REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.6.1.
*/

include( "./library/Base/safeInvoke.js" );
include( "./library/ServiceBased/SessionServiceSet/CreateSession/minimum_parallel_sessions.js" );

function createSession561007()
{
    MinimumParallelSessions( g_sessions, g_sessionCount );
}

safelyInvoke( createSession561007 );