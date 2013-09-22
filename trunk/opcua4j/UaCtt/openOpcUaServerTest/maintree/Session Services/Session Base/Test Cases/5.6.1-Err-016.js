/*  Test 5.6.1 Error case 16 prepared by Development; compliance@opcfoundation.org
    Description:
        Send an invalid (too short) client nonce
        Receiving a Bad_NonceIdInvlalid.

    Revision History:
        28-Aug-2009 DEV: Initial version.
        23-Nov-2009 NP: REVIEWED.
        07-Dec-2009 DP: Removed unreachable code, refactored the uaStatus validation
                        to use AssertStatusCodeIs, and allow checkCreateSessionFailed
                        to be called regardless of uaStatus. This probably still isn't
                        right, but I'm not entirely sure what it should look like.
        29-Jun-2011 Matthias Lechner: Use CreateDefaultCreateSessionRequest() to build a
                    CreateSession-request. Otherwise, the test may fail for other reasons
                    than the expected.
*/

function createSession561Err016()
{
    if( !isChannelSecure( g_channel ) )
    {
        addSkipped( "Channel is not secure. Cannot perform test." );
        return;
    }

    var createSessionRequest = CreateDefaultCreateSessionRequest( g_session );
    var createSessionResponse = new UaCreateSessionResponse();

    createSessionRequest.ClientNonce = UaCryptoProvider.createRandomData( 16 );

    var uaStatus = g_session.createSession( createSessionRequest, createSessionResponse );
    if( uaStatus.isGood() )
    {
        var ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNonceInvalid );
        checkCreateSessionFailed( createSessionRequest, createSessionResponse, ExpectedServiceResult );
    }
    else
    {
        addError( "CreateSession() status " + uaStatus, uaStatus );
    }
}

safelyInvoke( createSession561Err016 );