include( "./library/ServiceBased/SessionServiceSet/CloseSession/check_closeSession_valid.js" );
include( "./library/ServiceBased/SessionServiceSet/CloseSession/check_closeSession_failed.js" );

function closeSession( Session, expectedResult )
{
    if( Session === undefined || Session === null )
    {
        addError( "Cannot close a Session when the session specified is <null>." );
        return;
    }

    var uaStatus;

    var closeSessionRequest = new UaCloseSessionRequest();
    var closeSessionResponse = new UaCloseSessionResponse();
    Session.buildRequestHeader( closeSessionRequest.RequestHeader );
    closeSessionRequest.DeleteSubscriptions = true;
    
    uaStatus = Session.closeSession( closeSessionRequest, closeSessionResponse );
    if( expectedResult !== undefined && expectedResult !== null )
    {
        return( checkCloseSessionFailed( closeSessionRequest, closeSessionResponse, expectedResult ) );
    }
    else
    {
        return( checkCloseSessionValidParameter( closeSessionRequest, closeSessionResponse ) );
    }
}