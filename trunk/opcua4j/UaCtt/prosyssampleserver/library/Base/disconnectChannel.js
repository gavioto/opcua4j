
function disconnectChannel( Channel )
{
    var uaStatus = new UaStatusCode();
    if( arguments.length < 1 )
    {
        addError( "function disconnectChannel(): Number of arguments must be 1!" );
        return false;
    }

    addLog( "disconnecting channel" );
    uaStatus = Channel.disconnect();
    if( uaStatus.isGood() )
    {
        return true;
    }
    else if( uaStatus.StatusCode == StatusCode.BadConnectionClosed)
    {
        print( "function disconnectChannel Channel.disconnect() returned: " + uaStatus, uaStatus );
        return true;
    }
    else
    {
        addError( "Disconnect() status " + uaStatus, uaStatus );
        return false;
    }
}