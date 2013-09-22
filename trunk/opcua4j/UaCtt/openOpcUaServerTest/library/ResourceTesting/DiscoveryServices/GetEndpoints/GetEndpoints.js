/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Calls GetEndpoints repetively, default parameters.

    Revision History
        04-Jan-2010 NP: Initial version.
*/

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/ServiceBased/DiscoveryServiceSet/GetEndpoints/getEndpoints.js" );

// this is the function that will be called repetitvely
function getEndpoints()
{
    if( !GetEndpointsHelper.Execute( endpoint, undefined, undefined, undefined, true ) )
    {
        addError( "Could not read the initial values of the Scalar nodes we want to test." );
    }
}

function initialize()
{
    GetEndpointsHelper = new GetEndpoints( g_session );
}

function connectOverride()
{
    g_channel = new UaChannel();
    g_session = new UaDiscovery( g_channel );
    return( connectChannel( g_channel, endpoint ) ); //endpoint: configured below
}

function disconnectOverride()
{
    disconnectChannel( g_channel );
}

// Create a service call helper and invoke the Read
var GetEndpointsHelper;

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/AttributeServicesCallCount" ).toString() );
var endpoint = readSetting( "/Server Test/Discovery URL" ).toString();

// create and configure PkiProvider    
var g_pkiProvider = new UaPkiUtility();
g_pkiProvider.CertificateTrustListLocation = readSetting( "/Ua Settings/Certificates/CertificateTrustListLocation" );
g_pkiProvider.CertificateRevocationListLocation = readSetting( "/Ua Settings/Certificates/CertificateRevocationListLocation" );
g_pkiProvider.PkiType = PkiType.OpenSSL_PKI;

// Perform the iterative call loop
repetitivelyInvoke( initialize, getEndpoints, loopCount, connectOverride, disconnectOverride, undefined, "GetEndpoints" );

// clean-up
originalScalarItems = null;
ReadHelper = null;