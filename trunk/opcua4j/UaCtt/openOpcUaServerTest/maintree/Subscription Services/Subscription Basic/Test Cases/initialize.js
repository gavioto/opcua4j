// Objects
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/integerSet.js" );
// utility functions
include( "./library/Base/array.js" );
include( "./library/Base/connect.js" );
include( "./library/Base/disconnect.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/check_timestamp.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
// read
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
// write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
// include all library scripts specific to monitored items tests
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
// ModifySubscription
include( "./library/ServiceBased/SubscriptionServiceSet/ModifySubscription/modifySubscription.js" );
// SetPublishingMode
include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/setPublishingMode.js" );
// Publish
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
// Republish
include( "./library/ServiceBased/SubscriptionServiceSet/Republish/check_republish_valid.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/Republish/check_republish_failed.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/writeToDeadbandAndCheckWithPublish.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );


var defaultStaticItem = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" ).name, 1 );
defaultStaticItem.DataType = NodeIdSettings.guessType( defaultStaticItem.NodeSetting );
if( defaultStaticItem == undefined || defaultStaticItem == null )
{
    addSkipped( "Static Scalar (numeric)" );
    stopCurrentUnit();
}
defaultStaticItem.DataType = NodeIdSettings.guessType( defaultStaticItem.NodeSetting );

// check the fastest support publishingInterval setting
var FASTEST_SUPPORT_SETTING = "/Server Test/Fastest Publish Interval Supported";
var fastestPublishingIntervalSupported = readSetting( FASTEST_SUPPORT_SETTING ).toString();
if( fastestPublishingIntervalSupported === null || fastestPublishingIntervalSupported === "" )
{
    addSkipped( FASTEST_SUPPORT_SETTING );
    stopCurrentUnit();
}

// Connect to the server 
var g_channel = new UaChannel();
var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );

if( !connect( g_channel, g_session ) )
{
    stopCurrentUnit();
}

var readService  = new Read ( g_session );
var writeService = new Write( g_session );
var publishService = new Publish( g_session );

const DO_NOT_VERIFY_WRITE = false;
const DO_NOT_ACK_SEQUENCE = true;