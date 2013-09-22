/*  Prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Invoke CreateSession with default parameters.
        Go into a loop testing the RequestedSessionTimeout parameter with different 
        values to see if the Server revises them, and to what degree.

    Revision History
        28-Sep-2009 NP: Initial version.
        23-Nov-2009 NP: REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.6.1.
*/

include( "./library/Base/safeInvoke.js" );

function createSession561004()
{
    // the timeout values we will test...
    var testTimeoutValue = [ 0, 752, 1927, 4330, 75000, 100200, 3333000, Constants.Int32_Max ];

    // go into a loop to test each of the above timeout values
    for( var i=0; i<testTimeoutValue.length; i++ )
    {
        addLog( "Testing session timeout of: " + testTimeoutValue[i] + " ms." );
        // create our header objects and then establish a session
        var createSessionRequest = CreateDefaultCreateSessionRequest( g_session );
        var createSessionResponse = new UaCreateSessionResponse();

        createSessionRequest.RequestedSessionTimeout = testTimeoutValue[i];

        var uaStatus = g_session.createSession( createSessionRequest, createSessionResponse );

        // check result
        if( uaStatus.isGood() )
        {
            if( activateSession( g_session ) )
            {
                checkCreateSessionValidParameter( g_session, createSessionRequest, createSessionResponse );
            }

            // check the revised timeout setting and log any differences found.
            // This is not a test that can fail as such.
            if( createSessionRequest.RequestedSessionTimeout !== createSessionResponse.RevisedSessionTimeout )
            {
                addLog( "Session Timeout Difference detected!!!!!" +
                    "  RequestedSessionTimeout=" + createSessionRequest.RequestedSessionTimeout +
                    "; RevisedSessionTimeout=" + createSessionResponse.RevisedSessionTimeout );
            }
            else
            {
                addLog( "Session timeout accepted! we specified: " + createSessionRequest.RequestedSessionTimeout + "; we received: " + createSessionResponse.RevisedSessionTimeout );
            }

            closeSession( g_session );
        }
        else
        {
            addError( "CreateSession() status " + uaStatus, uaStatus );
        }
    }// for i...
}

safelyInvoke( createSession561004 );