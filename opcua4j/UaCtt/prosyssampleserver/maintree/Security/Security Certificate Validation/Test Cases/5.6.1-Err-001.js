/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Client certificate signed with a private key not matching the certificate's
        public key.
    Revision History:
        14-Oct-2009 RTD: Initial version.
        09-Jun-2010 NP: Corrected TransportProfileURI to match specs.
        03-Aug-2011 NP: Added assertion to pass/fail the test based on the expected servers' response.
                        Commented-out line because all tested servers are returning different codes. Seeking CMP intervention.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section x.x.x.
*/

/*
    04-AUG-2011 NP: DISABLING SCRIPT BECAUSE IT IS NOT CORRECT, PER THE TEST-CASE.
function certificateValidation561001()
{
    // Load the certificates.
    var cert = new UaByteString();
    print( "Loading Client Certificate from file:\r\t" + readSetting( "/Ua Settings/Certificates/IncorrectlySignedClientCertificate" ).toString() );
    g_pkiProvider.loadCertificateFromFile( readSetting( "/Ua Settings/Certificates/IncorrectlySignedClientCertificate" ).toString(), cert );
    if ( cert.isEmpty() )
    {
        throw ( "Certificate not loaded." );
    }

    // Load the private key.
    var key = new UaByteString();
    print( "Loading Client Private Key from file:\r\t" + readSetting( "/Ua Settings/Certificates/IncorrectlySignedClientPrivateKey" ).toString() );
    g_pkiProvider.loadPrivateKeyFromFile( readSetting( "/Ua Settings/Certificates/IncorrectlySignedClientPrivateKey" ).toString(), key );
    if ( key.isEmpty() )
    {
        throw ( "Private key not loaded." );
    }

    // did we get a certificate from the server in the initialize.js script? if so then use it, otherwise just load 
    // the certificate defined in the CTT Settings dialog.
    if( g_security.ServerCertificate === undefined || g_security.ServerCertificate === null )
    {
        // load server certificate
        var serverCertificate = new UaByteString();
        uaStatus = g_pkiProvider.loadCertificateFromFile( readSetting( "/Ua Settings/Certificates/ServerCertificate" ), serverCertificate );
        if( uaStatus.isGood() )
        {
            addLog( "ServerCertificate was NOT loaded from the Server.\nCTT has loaded the ServerCertificate from the CTT Settings.\nLoad ServerCertificate returned: " + uaStatus );
            g_security.ServerCertificate = serverCertificate;
        }
        else
        {
            addError( "ServerCertificate was NOT loaded from the Server. CTT tried to load the certificate defined in the settings which returned error: " + uaStatus + ".\nAborting test.", uaStatus );
            return;
        }
    }

    // Connect to the secure channel.
    var channel = new UaChannel();
    channel.ClientCertificate = cert;
    channel.ClientPrivateKey = key;
    channel.MessageSecurityMode = g_security.SecurityMode;
    channel.RequestedSecurityPolicyUri = g_security.SecurityPolicyUri;
    channel.ServerCertificate = g_security.ServerCertificate;
    var status = channel.connect( g_security.EndpointUrl );
    addLog( "Channel connection status: " + status );
    if( channel.IsConnected === true )
    {
        if( g_security.SecureEndpoint === false )
        {
            addError( "The connection was established when it should not have been.\nThe connection is secured and the server was required to validate the certificate first." );
        }
        channel.disconnect();
    }
    if( g_security.SecureEndpoint )
    {
        var expectedErr = new UaStatusCode( StatusCode.BadSecurityChecksFailed );
        AssertStatusCodeIs( expectedErr, status, "The Client signed its certificate with an incorrect private key, Connect expected to fail: " + expectedErr + "; but received" );
    }
    else
    {
        addWarning( "ClientCertificate validation is NOT required by the server because the current connection is NOT secure.\nTherefore, we will not make any assertions here on the expected return code." );
    }
}

safelyInvoke( certificateValidation561001 );*/