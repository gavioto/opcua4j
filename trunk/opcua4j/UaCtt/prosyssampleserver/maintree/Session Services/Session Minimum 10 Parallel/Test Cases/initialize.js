include( "./library/Base/safeInvoke.js" );
include( "./library/Base/connectChannel.js" );
include( "./library/ServiceBased/SessionServiceSet/CloseSession/closeSession.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/multiSessionMultiSubscribeTest.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );

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