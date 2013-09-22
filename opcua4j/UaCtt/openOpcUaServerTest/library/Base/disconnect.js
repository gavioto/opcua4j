include("./library/Base/disconnectChannel.js")
include("./library/ServiceBased/SessionServiceSet/CloseSession/closeSession.js")

function disconnect( Channel, Session )
{
    // check function parameters
    if( Channel == null || Channel == undefined || Session == null || Session == undefined )
    {
        return;
    }

    var uaStatus = new UaStatusCode();
    var bSucceeded = true;

    // check parameters
    if( arguments.length != 2 )
    {
        addError( "function disconnect(Channel, Session): Number of arguments must be 2. Got " + arguments.length + " instead" );
        return false;
    }    

    // close session
    if( !closeSession( Session ) )
    {
        bSucceeded = false;
    }

    // disconnect channel
    if( !disconnectChannel( Channel ) )
    {
        bSucceeded = false;
    }
    else
    {
        print( "Disconnected channel." );
    }

    return bSucceeded;
}

// Closes a session without closing the Channel. Used by multi-subscription (per session) tests.
function disconnectSession( Channel, Session )
{
    var bSucceeded = true;

    // check parameters
    if( arguments.length != 2 )
    {
        addError( "function disconnectSessions(Channel, Session): Number of arguments must be 2. Got " + arguments.length + " instead" );
        return false;
    }    

    // close session
    if( !closeSession( Session ) )
    {
        return false;
    }

    if( bSucceeded )
    {
        print( "Session closed." );
    }

    return true;
}