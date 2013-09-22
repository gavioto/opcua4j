/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Invoke CreateSession with default parameters.

    Revision History:
        18-Sep-2009 RTD: Initial version.
        23-Nov-2009 NP : REVIEWED.
        04-Dec-2009 DP: Added a check to verify the BrowseName of the session node
                        is equal to the requested SessionName (there is no other test
                        that verifies this).
        29-Apr-2010 RTD: Using helper functions.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.6.1.
*/

include( "./library/Base/safeInvoke.js" );

function createSession561001()
{
    if ( createSession( g_session ) )
    {
        if ( activateSession( g_session ) )
        {
            closeSession( g_session );        
        }
    }
}

safelyInvoke( createSession561001 );