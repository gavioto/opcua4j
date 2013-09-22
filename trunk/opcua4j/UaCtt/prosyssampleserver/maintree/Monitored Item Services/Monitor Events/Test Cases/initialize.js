// Objects
include( "./library/Base/SettingsUtilities/validate_setting.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/Objects/event.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/safeInvoke.js" );
// utility functions
include( "./library/Base/connect.js" );
include( "./library/Base/array.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
// include all library scripts specific to monitored items tests
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js")
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
// SetMonitoringMode
include( "./library/ServiceBased/MonitoredItemServiceSet/SetMonitoringMode/setMonitoringMode.js" );
// Publish 
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
// Write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );

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
MonitorEventsSubscription = new Subscription();  
if( createSubscription( MonitorEventsSubscription, g_session ) == false )
{
    stopCurrentUnit();
}

// create some Helper objects
var PublishHelper = new Publish( g_session );