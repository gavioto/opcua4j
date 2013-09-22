/*  Test 5.6.3 Error test case #1 prepared by Development; compliance@opcfoundation.org
    Description:
        Calls CloseSession twice, the 2nd time being being a session that no
        longer exists. Expect 'BadSessionIdInvalid' or 'Bad_SessionClosed'.

    Revision History:
        16-Sep-2009 DEV: Initial version.
        24-Nov-2009 NP: REVIEWED.
        07-Dec-2009 DP: Refactored a bit to display clearer messages when the test fails.
        11-Mar-2011 NP: Allowing for both SessionIdInvalid and (just added) SessionClosed.
*/

function closeSession563Err001()
{
    var uaStatus;

    if( createSession( g_session ) && activateSession( g_session ) )
    {
        closeSession( g_session );

        // call again with the same parameters
        var expectedResult = new ExpectedAndAcceptedResults( StatusCode.BadSessionIdInvalid );
        expectedResult.addExpectedResult( StatusCode.BadSessionClosed );
        closeSession( g_session, expectedResult, true );
    }
}

safelyInvoke( closeSession563Err001 );