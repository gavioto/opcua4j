include( "./library/Base/connectChannel.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/locales.js" );
include( "./library/Base/assertions.js" );

// include all library scripts specific to getEndpoints tests
include( "./library/ServiceBased/DiscoveryServiceSet/GetEndpoints/check_getEndpoints_valid.js" );
include( "./library/ServiceBased/DiscoveryServiceSet/GetEndpoints/check_getEndpoints_failed.js" );
include( "./library/ClassBased/UaGetEndpointsRequest/createDefaultGetEndpointsRequest.js" );

// check scripts for services from other service sets
include( "./library/ServiceBased/AttributeServiceSet/Read/check_read_valid.js" );

// Connect to the server
var f_channel = new UaChannel();
var g_discovery = new UaDiscovery( f_channel );

if( !connectChannel( f_channel, readSetting( "/Server Test/Discovery URL" ) ) )
{
    addError( "Connect()" );
    stopCurrentUnit();
}

//  read the current time from the server  - we need the time difference later to check the timestamp in the responseHeader
getServerTimeDiff();

// create and configure PkiProvider    
var g_pkiProvider = new UaPkiUtility();
g_pkiProvider.CertificateTrustListLocation = readSetting( "/Ua Settings/Certificates/CertificateTrustListLocation" );
g_pkiProvider.CertificateRevocationListLocation = readSetting( "/Ua Settings/Certificates/CertificateRevocationListLocation" );
g_pkiProvider.PkiType = PkiType.OpenSSL_PKI;