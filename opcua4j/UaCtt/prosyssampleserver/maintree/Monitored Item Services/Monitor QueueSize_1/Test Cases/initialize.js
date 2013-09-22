// Testing functions
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItemsTestQueue.js" );

// Objects
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/Objects/event.js" );
include( "./library/Base/array.js" );

// utility functions
include( "./library/Base/connect.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
// include all library scripts specific to monitored items tests
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js")
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/basicCreateMonitoredItemsTest.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
// Publish 
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/check_publish_valid.js" );
// Write
include( "./library/ServiceBased/AttributeServiceSet/Write/check_write_valid.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );

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
MonitorQueueSize1Subscription = new Subscription();
MonitorQueueSize1Subscription.MaxKeepAliveCount = 15;
MonitorQueueSize1Subscription.LifetimeCount = 200; // 100 * 200 = 20 second lifetime
createSubscription( MonitorQueueSize1Subscription, g_session );