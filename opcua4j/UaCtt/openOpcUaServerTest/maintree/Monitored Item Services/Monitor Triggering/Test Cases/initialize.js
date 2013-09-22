/*globals addError, connect, createSubscription, getServerTimeDiff, include, 
  Publish, SetTriggering, stopCurrentUnit, Subscription, UaChannel, UaSession, Write
*/

include( "./library/Base/connect.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/array.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/Objects/event.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
// SetTriggering
include( "./library/ServiceBased/MonitoredItemServiceSet/SetTriggering/setTriggering.js" );
// CreateSubscription
include( "./library/Base/Objects/subscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
// Publish 
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
// Write 
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );

const SAMPLING_RATE_FASTEST = 0;

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
var MonitorTriggeringSubscription = new Subscription();
MonitorTriggeringSubscription.RevisedLifetimeCount = 100; // long timeout needed for this CU
createSubscription( MonitorTriggeringSubscription, g_session );

// create some helper objects that can be used by the scripts
var PublishHelper = new Publish( g_session );
var WriteHelper   = new Write  ( g_session );
var ReadHelper    = new Read   ( g_session );
var SetTriggeringHelper = new SetTriggering( g_session );

print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Triggering' TEST SCRIPTS STARTING ******\n" );