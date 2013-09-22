// Testing functions
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItemsTestQueue.js" );

// Objects
include( "./library/Base/Objects/event.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/integerSet.js" );

// utility functions
include( "./library/Base/array.js" );
include( "./library/Base/connect.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/basicCreateMonitoredItemsTest.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );

// include all library scripts specific to monitored items tests
// ModifyMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/ModifyMonitoredItems/modifyMonitoredItems.js" );
// SetMonitoringMode
include( "./library/ServiceBased/MonitoredItemServiceSet/SetMonitoringMode/setMonitoringMode.js" );
// Write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );

// Connect to the server
var g_channel = new UaChannel();
var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );

if( !connect( g_channel, g_session ) )
{
    addError( "Connect failed. Stopping execution of current conformance unit.");
    stopCurrentUnit();
}

// create a subscription that can be used for all tests in this conformance unit
MonitorQueueSize2Subscription = new Subscription();
createSubscription( MonitorQueueSize2Subscription, g_session );

var WriteHelper   = new Write  ( g_session );
var PublishHelper = new Publish( g_session, MonitorQueueSize2Subscription.TimeoutHint );
var SetMonitoringModeHelper = new SetMonitoringMode( g_session );