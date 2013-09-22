// Test functions
include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/testParallelSubscriptions.js" );
// Objects
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/array.js" );
// utility functions
include( "./library/Base/connect.js" );
include( "./library/Base/disconnect.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/check_timestamp.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/UaVariantToSimpleType.js" );
// read
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
// write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
// SetPublishingMode
include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/setPublishingMode.js" );
// Publish
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );


var SUBSCRIPTION_PUBLISH_MIN_05_PUBLISHCALLCOUNT   = 10;   // how many times to call publish per session
var SUBSCRIPTION_PUBLISH_MIN_05_SESSIONCREATECOUNT = 5; // how many sessions to create

// Connect to the server 
var g_channel = new UaChannel();
connectChannel( g_channel);

// Connect to the server 
var g_channel = new UaChannel();
var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
if( !connect( g_channel, g_session ) )
{
    addError( "Connect failed. Stopping execution of current conformance unit.");
    stopCurrentUnit();
}

var publishService = new Publish( g_session );
var readService  = new Read ( g_session );
var writeService = new Write( g_session );

const DO_NOT_VERIFY_WRITE = false;