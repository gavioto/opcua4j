// Objects
include( "./library/Base/Objects/expectedResults.js" )
// utility functions
include("./library/Base/connect.js");
include("./library/Base/locales.js");
include("./library/Base/safeInvoke.js");
include("./library/ClassBased/UaFindServersRequest/createDefaultFindServersRequest.js");
// include all library scripts specific to findServers tests
// FindServers
include( "./library/ServiceBased/DiscoveryServiceSet/FindServers/check_findServers_valid.js" )
include( "./library/ServiceBased/DiscoveryServiceSet/FindServers/check_findServers_failed.js" )
// check scripts for services from other service sets
include("./library/ServiceBased/AttributeServiceSet/Read/check_read_valid.js");

// Connect to the server
var f_channel = new UaChannel();
var g_discovery = new UaDiscovery( f_channel );

if( !connectChannel( f_channel, readSetting("/Server Test/Discovery URL" ) ) )
{
    addError( "ConnectChannel failed. Stopping execution of current conformance unit.");
    stopCurrentUnit();
}

//  read the current time from the server  - we need the time difference later to check the timestamp in the responseHeader
getServerTimeDiff();