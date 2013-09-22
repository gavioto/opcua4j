include( "./library/Base/connect.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/Objects/event.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
// Write
include( "./library/ServiceBased/AttributeServiceSet/Write/check_write_valid.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/check_write_error.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/check_write_failed.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/writeMask_writeValues.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
// Read
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/check_read_valid.js" );
// include all library scripts specific to monitored items tests
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/check_createSubscription_valid.js" );
// Publish
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/check_publish_valid.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/check_publish_error.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/check_deleteSubscription_valid.js" );

var OPTIONAL_CONFORMANCEUNIT = true;
var SKIPWRITEVERIFICATION = true;
addLog( "TESTING AN -- OPTIONAL -- CONFORMANCE UNIT" );

// get some items that we can use throughout this CU
var scalarNodes = MonitoredItem.fromSettings( NodeIdSettings.ScalarStaticAll() );
if( scalarNodes == null || scalarNodes.length < 3 )
{
    addSkipped( "Static Scalar" );
    stopCurrentUnit();
}

// Connect to the server 
var g_channel = new UaChannel();
var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );

if( !connect( g_channel, g_session ) )
{
    addError( "Connect()" );
    stopCurrentUnit();
}

const ATTRIBUTE_WRITE_STATUSCODE_TIMESTAMP_NODE_TO_WRITE = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );

// create some Service helpers
var ReadHelper    = new Read   ( g_session );
var WriteHelper   = new Write  ( g_session );
var PublishHelper = new Publish( g_session );

print( "\n\n\n***** CONFORMANCE UNIT 'Attribute Write StatusCode & Timestamp' TESTS STARTING ******\n" );