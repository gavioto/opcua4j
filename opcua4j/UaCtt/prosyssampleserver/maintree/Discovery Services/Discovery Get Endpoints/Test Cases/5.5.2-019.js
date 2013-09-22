/*  Test 5.2.2 test 19 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Script calls FindServers and GetEndpoints.
        Script compares the ServerUri/ApplicationUri in all locations.
        The values must match.

        Searching the following locations:
            FindServers.Servers[0].ApplicationUri.
            GetEndpoints.Results[0].?
            AddressSpace->ServerArray[0]
            AddressSpace->NamespaceArray[1]

    Revision History
        13-Jun-2011 NP: Initial version, based on an idea by MI.
*/

include( "./library/ClassBased/UaFindServersRequest/createDefaultFindServersRequest.js" );
include( "./library/ServiceBased/DiscoveryServiceSet/FindServers/check_findServers_valid.js" );
include( "./library/ServiceBased/DiscoveryServiceSet/FindServers/check_findServers_failed.js" );

include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );

var g_session;

// simple object to store values inside (pass-by-ref)
function appUriInfo()
{
}

// fetches the required information from FindServers
function getAppUriFromFindServers( obj )
{
    var findServersRequest = CreateDefaultFindServersRequest();
    var findServersResponse = new UaFindServersResponse();

    var uaStatus = g_discovery.findServers( findServersRequest, findServersResponse);
    if( checkFindServersValidParameter( findServersRequest, findServersResponse ) )
    {
        obj.FindServers = findServersResponse.Servers[0].ApplicationUri;
    }
}

// fetches the required information from GetEndpoints
function getAppUriFromGetEndpoints( obj )
{
    var getEndpointsRequest = CreateDefaultGetEndpointsRequest();
    var getEndpointsResponse = new UaGetEndpointsResponse();
    
    var uaStatus = g_discovery.getEndpoints( getEndpointsRequest, getEndpointsResponse );
    if( getEndpointsResponse.Endpoints.length > 0 )
    {
        obj.GetEndpoints = getEndpointsResponse.Endpoints[0].Server.ApplicationUri;

        //obtain appUri from serverCertificate
        var serverCert = UaPkiCertificate.fromDER( getEndpointsResponse.Endpoints[0].ServerCertificate );
        obj.ServerCertificate = serverCert.ApplicationUri;
    }
    //clean-up
    getEndpointsResponse = null;
    getEndpointsRequest = null;
}

// fetches the required information from the servers address space
function getAppUriFromAddressSpace( obj )
{
    // create our items and then issue the Read call
    var serverArray = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerArray ) )[0];
    var namespaceArray = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_NamespaceArray ) )[0];

    var readHelper = new Read( g_session );
    if( readHelper.Execute( [serverArray, namespaceArray] ) )
    {
        var strArray;
        if( serverArray.Value.Value.getArraySize() > 0 )
        {
            strArray = serverArray.Value.Value.toStringArray();
            obj.ServerArray = strArray[0];
        }

        if( namespaceArray.Value.Value.getArraySize() > 0 )
        {
            strArray = namespaceArray.Value.Value.toStringArray();
            obj.NamespaceArray = strArray[1];
        }
    }
    //clean-up
    readHelper = null;
}

function checkApplicationUri()
{
    // Connect to the server
    var f_channel = new UaChannel();
    var g_discovery = new UaDiscovery( f_channel );
    // attempt the connection
    if( !connectChannel( f_channel, readSetting("/Server Test/Discovery URL" ) ) )
    {
        addError( "ConnectChannel failed. Stopping execution of current conformance unit.");
        stopCurrentUnit();
    }

    var obj = new appUriInfo();
    getAppUriFromFindServers( obj );
    getAppUriFromGetEndpoints( obj );

    // disconnect from server
    disconnectChannel( f_channel );

    // create a new session for browsing
    g_session = new UaSession( f_channel );
    g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );

    if( !connect( f_channel, g_session ) )
    {
        addError( "ConnectChannel failed. Stopping execution of current conformance unit.");
        stopCurrentUnit();
    }

    getAppUriFromAddressSpace( obj );

    // disconnect from server
    closeSession( g_session );
    disconnectChannel( f_channel );

    print( "ApplicationUri's:\n\tFindServers: " + obj.FindServers +
        "\n\tGetEndpoints: " + obj.GetEndpoints +
        "\n\tServerCertificate: " + obj.ServerCertificate +
        "\n\tServerArray: " + obj.ServerArray + 
        "\n\tNamespaceArray: " + obj.NamespaceArray );

    // now compare that all values in our object are equal
    if (!AssertTrue( obj.FindServers == obj.GetEndpoints &&
        obj.GetEndpoints == obj.ServerCertificate &&
        obj.ServerCertificate == obj.ServerArray &&
        obj.ServerArray == obj.NamespaceArray, "ApplicationUri must match in all places where it is used." ) )
        {
            addLog( "ApplicationUri in FindServers: " + obj.FindServers );
            addLog( "ApplicationUri in GetEndpoints: " + obj.GetEndpoints );
            addLog( "ApplicationUri in ServerCertificate: " + obj.ServerCertificate );
            addLog( "ApplicationUri in ServerArray: " + obj.ServerArray );
            addLog( "ApplicationUri in NamespaceArray: " + obj.NamespaceArray );
    
        }
}

safelyInvoke( checkApplicationUri );