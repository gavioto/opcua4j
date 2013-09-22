include( "./library/Base/connectChannel.js" )

// include all library scripts specific to findServers tests
include( "./library/ServiceBased/DiscoveryServiceSet/RegisterServer/check_registerServer_valid.js" )
include( "./library/ServiceBased/DiscoveryServiceSet/RegisterServer/check_registerServer_failed.js" )

// Connect to the server
var f_channel = new UaChannel();
var g_discovery = new UaDiscovery( f_channel );

if( !connectChannel( f_channel, readSetting( "/Server Test/Discovery URL" ) ) )
{
    addError( "ConnectChannel failed. Stopping execution of current conformance unit.");
    stopCurrentUnit();
}

//  read the current time from the server  - we need the time difference later to check the timestamp in the responseHeader
getServerTimeDiff();