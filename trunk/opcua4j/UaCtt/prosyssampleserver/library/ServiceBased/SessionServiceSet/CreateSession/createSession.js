include( "./library/ServiceBased/SessionServiceSet/CreateSession/isChannelSecure.js" );
include( "./library/ServiceBased/SessionServiceSet/ActivateSession/activateSession.js" );
include( "./library/ClassBased/UaCreateSessionRequest/createDefaultCreateSessionRequest.js" );
include( "./library/ServiceBased/SessionServiceSet/CreateSession/check_createSession_valid.js" );
include( "./library/ServiceBased/SessionServiceSet/CreateSession/check_createSession_failed.js" );

/*  createSession - helper object for simplifying calls to CreateSession
    Revision History:
        29-Apr-2010 RTD: Added 'expectedResults' and parameter.

    Parameters:
        session            - the SESSION object that maintains the session with UA Server 
        expectedResults    - (OPTIONAL) 'ExpectedAndAcceptedResults' objects
*/

function createSession( session, expectedResults )
{
    var uaStatus;
    var success = true;
    var createSessionRequest = CreateDefaultCreateSessionRequest( session );
    var createSessionResponse = new UaCreateSessionResponse();

    session.DefaultTimeoutHint = readSetting( "/Ua Settings/Session/DefaultTimeoutHint" );

    uaStatus = session.createSession( createSessionRequest, createSessionResponse );
    
    // the session must be activated to allow the verification of the CreateSession response, because it uses some
    // extra services (e.g. Read for checking the session name ).
    if( activateSession( session ) )
    {    
        if( uaStatus.isGood() )
        {
            if( expectedResults === undefined )
            {
                success = checkCreateSessionValidParameter( session, createSessionRequest, createSessionResponse );
            }
            else
            {
                success = checkCreateSessionFailed( createSessionRequest, createSessionResponse, expectedResults );
            }
            
        }
        else
        {
            addError( "CreateSession() status " + uaStatus, uaStatus );
            success = false;
        }
    }
    else
    {
        success = false;
    }
    
    return success;
}