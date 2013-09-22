include( "./library/ServiceBased/SessionServiceSet/CreateSession/isChannelSecure.js" );

// NP 26-May-2011: The following variable/function generate unique Session names and are used by all test-scripts creating sessions.
var __GLOBAL_SessionNumber;
if( __GLOBAL_SessionNumber === undefined )
{
    __GLOBAL_SessionNumber = 1;
}
function getNextSessionName()
{
    return( "UaCttSession_" + __GLOBAL_SessionNumber++ );
}


function connectChannel( Channel, ServerUrl, requestedSecurityPolicyUriOverride, messageSecurityModeOverride )
{
    var uaStatus;
    var url;
    
    if( arguments.length < 1 )
    {
        addError( "function connectChannel(): Number of arguments must be 1 or 2!" );
        return false;
    }
    
    if( arguments.length > 1 )
    {
        url = arguments[1];
    }
    else
    {
        url = readSetting( "/Server Test/Server URL" );
    }
    
    // read security settings, or force our own overrides (from parameters)
    if( requestedSecurityPolicyUriOverride == undefined || requestedSecurityPolicyUriOverride == null )
    {
        Channel.RequestedSecurityPolicyUri = readSetting( "/Ua Settings/Secure Channel/RequestedSecurityPolicyUri" );
    }
    else
    {
        Channel.RequestedSecurityPolicyUri = requestedSecurityPolicyUriOverride;
        print( "\tOverriding the SecureChannel PolicyUri to: " + Channel.RequestedSecurityPolicyUri );
    }
    if( messageSecurityModeOverride == undefined || messageSecurityModeOverride == null )
    {
        Channel.MessageSecurityMode = readSetting( "/Ua Settings/Secure Channel/MessageSecurityMode" );
    }
    else
    {
        Channel.MessageSecurityMode = messageSecurityModeOverride;
        print( "\tOverriding the MessageSecurityMode to: " + Channel.MessageSecurityMode );
    }

    // create and configure PkiProvider    
    var pkiProvider = new UaPkiUtility();
    pkiProvider.CertificateTrustListLocation = readSetting( "/Ua Settings/Certificates/CertificateTrustListLocation" );
    pkiProvider.CertificateRevocationListLocation = readSetting( "/Ua Settings/Certificates/CertificateRevocationListLocation" );
    pkiProvider.PkiType = PkiType.OpenSSL_PKI;

    var clientCertificate = new UaByteString();
    var clientPrivateKey  = new UaByteString();
    var serverCertificate = new UaByteString();
    
    // load client certificate
    uaStatus = pkiProvider.loadCertificateFromFile( readSetting( "/Ua Settings/Certificates/ClientCertificate" ), clientCertificate );
    print( "load clientCertificate returned " + uaStatus );
    
    // load client private key
    uaStatus = pkiProvider.loadPrivateKeyFromFile( readSetting( "/Ua Settings/Certificates/ClientPrivateKey" ), clientPrivateKey );
    print( "load clientPrivateKey returned " + uaStatus );
    
    // load server certificate
    uaStatus = pkiProvider.loadCertificateFromFile( readSetting( "/Ua Settings/Certificates/ServerCertificate" ), serverCertificate );
    print( "load serverCertificate returned " + uaStatus );

    Channel.PkiType = PkiType.OpenSSL_PKI;
    Channel.CertificateTrustListLocation = readSetting( "/Ua Settings/Certificates/CertificateTrustListLocation" );
    Channel.CertificateRevocationListLocation = readSetting( "/Ua Settings/Certificates/CertificateRevocationListLocation" );
    Channel.ClientCertificate = clientCertificate;
    Channel.ClientPrivateKey  = clientPrivateKey;
    Channel.ServerCertificate = serverCertificate;

    addLog( "connecting channel to " + url );
    uaStatus = Channel.connect( url );
    if( uaStatus.isGood() )
    {
        return true;
    }
    else
    {
        addError( "Connect() status " + uaStatus, uaStatus );
        return false;
    }    
}

// helper function to connect to an unsecure endpoint (used for discovery)
function connectChannelNoSecurity( Channel, ServerUrl )
{
    var uaStatus;
    var url;
    
    if( arguments.length < 1 )
    {
        addError( "function connectChannelNoSecurity(): Number of arguments must be 1 or 2!" );
        return false;
    }
    
    if( arguments.length > 1 )
    {
        url = arguments[1];
    }
    else
    {
        url = readSetting( "/Server Test/Server URL" );
    }
    
    addLog( "connecting channel to " + url );
    uaStatus = Channel.connect( url );
    if( uaStatus.isGood() )
    {
        return true;
    }
    else
    {
        addError( "Connect() [NoSecurity] status " + uaStatus, uaStatus );
        return false;
    }    
}