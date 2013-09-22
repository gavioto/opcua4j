include( "./library/Base/connectChannel.js" );
include( "./library/ServiceBased/SessionServiceSet/CreateSession/createSession.js" );

// Connect to the server 
var g_channel = new UaChannel();
if (!connectChannel(g_channel, readSetting("/Server Test/Server URL")))
{
  addError( "connectChannel failed. Stopping execution of current conformance unit.");
  stopCurrentUnit();        
}

// create and configure PkiProvider    
var g_pkiProvider = new UaPkiUtility();
g_pkiProvider.CertificateTrustListLocation = readSetting( "/Ua Settings/Certificates/CertificateTrustListLocation" );
g_pkiProvider.CertificateRevocationListLocation = readSetting( "/Ua Settings/Certificates/CertificateRevocationListLocation" );
g_pkiProvider.PkiType = PkiType.OpenSSL_PKI;

var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );