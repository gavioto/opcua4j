// Objects
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/Objects/event.js" );
include( "./library/Base/array.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
// utility functions
include( "./library/Base/connect.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/safeInvoke.js" );
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
// Publish
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
// TransferSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/TransferSubscriptions/transferSubscription.js");
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
// ModifyMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/ModifyMonitoredItems/modifyMonitoredItems.js" );
// SetMonitoringMode
include( "./library/ServiceBased/MonitoredItemServiceSet/SetMonitoringMode/setMonitoringMode.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
// SetTriggering
include( "./library/ServiceBased/MonitoredItemServiceSet/SetTriggering/setTriggering.js" );
// Read
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
// Write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );

// Connect to the server
var g_channel = new UaChannel();
var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );

if( !connect( g_channel, g_session ) )
{
    addError( "Connect()" );
    stopCurrentUnit();
}

// create a subscription that can be used for all tests in this conformance unit
var MonitorBasicSubscription = new Subscription();
if( !createSubscription( MonitorBasicSubscription, g_session ) )
{
    stopCurrentUnit();
}

// create some helpers object for the g_session
var publishService       = new Publish( g_session, MonitorBasicSubscription.TimeoutHint );
var setMonitoringService = new SetMonitoringMode( g_session );
var WriteHelper = new Write( g_session );
var ReadHelper  = new Read ( g_session );
var ModifyMIsHelper = new ModifyMonitoredItemsHelper( g_session );

print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Basic' TEST SCRIPTS STARTING ******\n" );