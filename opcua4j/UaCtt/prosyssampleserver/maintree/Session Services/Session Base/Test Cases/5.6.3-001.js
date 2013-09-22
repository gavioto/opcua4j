/*  Test 5.6.3 Test #1 prepared by Development; compliance@opcfoundation.org
    Description:
        CloseSession using default parameters.
        This test works by first opening a session (default parameters) and then
        closes it.

    Revision History
        16-Sep-2009 DEV: Initial version.
        24-Nov-2009 NP: REVIEWED.
*/

function closeSession563001()
{
    if( createSession( g_session ) && activateSession( g_session ) )
    {
        var closeSessionRequest = new UaCloseSessionRequest();
        var closeSessionResponse = new UaCloseSessionResponse();    
        g_session.buildRequestHeader(closeSessionRequest.RequestHeader);

        // the default is TO deleteSubscriptions when we close the session.
        closeSessionRequest.DeleteSubscriptions = true;

        uaStatus = g_session.closeSession( closeSessionRequest, closeSessionResponse );
        if( uaStatus.isGood() )
        {
            checkCloseSessionValidParameter( closeSessionRequest, closeSessionResponse );
        }
        else
        {
            addError( "CloseSession() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( closeSession563001 );