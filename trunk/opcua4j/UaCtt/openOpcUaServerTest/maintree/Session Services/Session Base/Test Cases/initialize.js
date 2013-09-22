include( "./library/Base/connectChannel.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/array.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/ServiceBased/SessionServiceSet/CloseSession/check_closeSession_valid.js" );
include( "./library/ServiceBased/SessionServiceSet/CloseSession/check_closeSession_failed.js" );

// Connect to the server 
var g_channel = new UaChannel();
if( !connectChannel( g_channel, readSetting( "/Server Test/Server URL" ) ) )
{
  addError( "connectChannel failed. Stopping execution of current conformance unit." );
  stopCurrentUnit();
}

// create and configure PkiProvider    
var g_pkiProvider = new UaPkiUtility();
g_pkiProvider.CertificateTrustListLocation = readSetting( "/Ua Settings/Certificates/CertificateTrustListLocation" );
g_pkiProvider.CertificateRevocationListLocation = readSetting( "/Ua Settings/Certificates/CertificateRevocationListLocation" );
g_pkiProvider.PkiType = PkiType.OpenSSL_PKI;

var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );