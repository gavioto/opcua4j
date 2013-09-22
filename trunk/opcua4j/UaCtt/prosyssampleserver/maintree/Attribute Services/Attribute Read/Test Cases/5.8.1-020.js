/*  Test 5.8.1 Test 20; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read the Server's state.
        This script verifies that the server reports as RUNNING_0, which should
        be the default state.

    Revision History
        23-Sep-2009 NP: Initial version.
        10-Nov-2009 NP: Reviewed.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581020()
{
    readAndCheckServerState( ServerState.Running, g_session );
}

safelyInvoke( read581020 );