function connectSessionToChannel( Channel, Session )
{
    var uaStatus = new UaStatusCode();

    // check parameters
    if( arguments.length != 2 )
    {
        addError( "function connect(Channel, Session): Number of arguments must be 2. Got " + arguments.length + " instead" );
        return false;
    }
        
    // create session
    if( !createSession( Session ) )
    {
        disconnectChannel( Channel );
        return false;
    }
       
    // activate session
    if( !activateSession( Session ) )
    {
        closeSession( Session );
        disconnectChannel( Channel );
        return false;
    }

    addLog( "connected" );
    return true;
}