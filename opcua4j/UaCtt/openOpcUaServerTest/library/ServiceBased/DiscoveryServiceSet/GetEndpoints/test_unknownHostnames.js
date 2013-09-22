include( "./library/Base/connect.js" );
include( "./library/Base/disconnect.js" );
include( "./library/ClassBased/UaGetEndpointsRequest/createDefaultGetEndpointsRequest.js" );

function unknownHost()
{
    var getEndpointsRequest = CreateDefaultGetEndpointsRequest();
    var getEndpointsResponse = new UaGetEndpointsResponse();

    var defaultEP = readSetting( "/Server Test/Discovery URL" ).toString();
    var indexOfColon = defaultEP.indexOf( ":", 8 );
    if( indexOfColon > 11 )
    {
        getEndpointsRequest.EndpointUrl = "opc.tcp://unknownHost:" + defaultEP.substring( 1 + indexOfColon );
    }
    else
    {
        addError( "Unable to retrieve PORT from the setting '/Server Test/Discovery URL'." );
        return;
    }

    // Connect to the server
    var f_channel = new UaChannel();
    var g_discovery = new UaDiscovery( f_channel );

    if( !connectChannel( f_channel, readSetting( "/Server Test/Discovery URL" ) ) )
    {
        addError( "Connect()" );
        return;
    }

    var uaStatus = g_discovery.getEndpoints( getEndpointsRequest, getEndpointsResponse );
    
    if( uaStatus.isBad() )
    {
        addError( "GetEndpoints() status " + uaStatus, uaStatus );
    }
    else
    {
        addLog( "GetEndpoints() returned " + getEndpointsResponse.Endpoints.length + " description(s)." );
        for( var i = 0; i < getEndpointsResponse.Endpoints.length; i++ )
        {
            addLog( "" );
            addLog( "Endpoints[" + i + "] = " + getEndpointsResponse.Endpoints[i] );
        }
    }

    // disconnect from server
    disconnectChannel( f_channel );

    // clean-up
    g_discovery = null;
    f_channel = null;
}

unknownHost();