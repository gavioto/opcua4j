/*  Revision Log:
        03-Jul-2011 NP: Bugfix: SecurityInfo() object is now defined with properties. The CU will now correctly abort if no 
                                secured endpoints exist.


// Utility functions.
include( "./library/Base/assertions.js" );
include( "./library/Base/connectChannel.js" );
include( "./library/Base/disconnectChannel.js" );
include( "./library/Base/safeInvoke.js" );

const SECURITY_CERTIFICATE_VALIDATION_TCPSECURITYPROFILEURI = "http://opcfoundation.org/UA-Profile/Transport/uatcp-uasc-uabinary";

function SecurityInfo()
{
    this.SecureEndpoint = false;
    this.EndpointUrl;
    this.SecurityPolicyUri;
    this.SecurityMode;
    this.ServerCertificate;
}

// Check if the server provides a secured endpoint for certificate validation testing.
// This check is done using information returned by the GetEndpoints service.
var g_security = new SecurityInfo();
var g_discoveryChannel = new UaChannel();
var g_discovery = new UaDiscovery( g_discoveryChannel );
if ( !connectChannel( g_discoveryChannel, readSetting( "/Server Test/Discovery URL" ) ) )
{
  addError( "connectChannel failed. Stopping execution of current conformance unit." );
  stopCurrentUnit();
}
var getEndpointsRequest = new UaGetEndpointsRequest();
// Only interested in UA-TCP endpoints (until the CTT adds support for SOAP).
getEndpointsRequest.ProfileUris[0] = SECURITY_CERTIFICATE_VALIDATION_TCPSECURITYPROFILEURI;
var getEndpointsResponse = new UaGetEndpointsResponse();

uaStatus = g_discovery.getEndpoints( getEndpointsRequest, getEndpointsResponse );
if ( uaStatus.isBad() )
{
  addError( "GetEndpoints failed. Stopping execution of current conformance unit." );
  stopCurrentUnit();
}

// Look for a secured endpoint among the available ones.
for ( var ii = 0; ii < getEndpointsResponse.Endpoints.length; ii++ )
{
  description = getEndpointsResponse.Endpoints[ii];
  if ( description.SecurityPolicyUri != SecurityPolicy.SecurityPolicy_None &&
       description.SecurityMode != MessageSecurityMode.Invalid &&
       description.SecurityMode != MessageSecurityMode.None )
  {
    g_security.SecureEndpoint = true;
    g_security.EndpointUrl = description.EndpointUrl;
    g_security.SecurityPolicyUri = SecurityPolicy.policyFromString( description.SecurityPolicyUri );
    g_security.SecurityMode = description.SecurityMode;
    g_security.ServerCertificate = description.ServerCertificate;
    break;
  }
}

if( g_security.SecureEndpoint === false )
{
    addWarning( "Server does not provide a secure endpoint. Some tests may not be possible to execute. Please add a Secure endpoint to your server to enable maximum testing." );
}

// Create and configure PKI provider.
var g_pkiProvider = new UaPkiUtility();
g_pkiProvider.CertificateTrustListLocation = readSetting( "/Ua Settings/Certificates/CertificateTrustListLocation" );
g_pkiProvider.CertificateRevocationListLocation = readSetting( "/Ua Settings/Certificates/CertificateRevocationListLocation" );
g_pkiProvider.PkiType = PkiType.OpenSSL_PKI;*/