include("./library/Base/connectChannel.js")
include("./library/ServiceBased/SessionServiceSet/CreateSession/createSession.js")
include("./library/ServiceBased/SessionServiceSet/ActivateSession/activateSession.js")
include( "./library/ServiceBased/SessionServiceSet/ActivateSession/check_activateSession_valid.js" );

function connect( Channel, Session )
{
    // check parameters
    if( arguments.length !== 2 )
    {
        addError( "function connect(Channel, Session): Number of arguments must be 2. Got " + arguments.length + " instead" );
        return false;
    }
    // connect channel
    if( !connectChannel( Channel ) )
    {
        return false;
    }
    // create and activate session
    if( !createSession( Session ) )
    {
        disconnectChannel( Channel );
        return false;
    }
    return true;
}

// Opens a session using an existing Channel. Used by multi-subscription (per session) tests.
function connectSession( Channel, Session )
{
    // create and activate session
    if( !createSession( Session ) )
    {
        disconnectChannel( Channel );
        return( false );
    }
    return( true );
}