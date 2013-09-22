/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Creates a session and immediately removes it.

    Revision History
        09-Jun-2011 NP: Initial version.
*/

include( "./library/ResourceTesting/repetitiveCall.js" );

// this is the function that will be called repetitvely
function createSessionForImmediateTermination()
{
    var g_session = new UaSession( g_channel );
    g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
    if( createSession( g_session ) )
    {
        if( activateSession( g_session ) )
        {
            closeSession( g_session );
        }
    }
    // clean-up
    g_session = null;
}

// Get a list of items to read from settings
var g_pkiProvider = new UaPkiUtility();
g_pkiProvider.CertificateTrustListLocation = readSetting( "/Ua Settings/Certificates/CertificateTrustListLocation" );
g_pkiProvider.CertificateRevocationListLocation = readSetting( "/Ua Settings/Certificates/CertificateRevocationListLocation" );
g_pkiProvider.PkiType = PkiType.OpenSSL_PKI;

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/SessionServiceSetCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( undefined, createSessionForImmediateTermination, loopCount );

// clean-up
g_pkiProvider = null;