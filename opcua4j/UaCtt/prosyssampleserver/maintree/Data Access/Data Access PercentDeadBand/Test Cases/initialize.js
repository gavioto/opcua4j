// utility functions
include( "./library/Base/array.js" );
include( "./library/Base/connect.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/Objects/event.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
include( "./library/NodeTypeBased/AnalogItemType/EURange.js" );
// Objects
include( "./library/Base/Objects/subscription.js" );
// View (Browse)
include( "./library/ServiceBased/ViewServiceSet/Browse/get_default_request.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/check_browse_valid.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/assert_browse_valid.js" );
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/writeToDeadbandAndCheckWithPublish.js" );
// ModifyMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/ModifyMonitoredItems/modifyMonitoredItems.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
//Publish
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
// Write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
// Read
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );

// Constants, applicable to conformance unit tests
var OVERFLOWBIT = 0x480;

// Connect to the server
var g_channel = new UaChannel();
var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );

if( !connect( g_channel, g_session ) )
{
    addError( "Connect()" );
    stopCurrentUnit();
}

// create a subscription that can be used for all tests in this Conformance Unit.
MonitorBasicSubscription = new Subscription();  
createSubscription( MonitorBasicSubscription, g_session );

// some Helper methods that can be used by all scripts within the Conformance Unit.
var PublishHelper = new Publish( g_session );
var ReadHelper    = new Read   ( g_session );
var WriteHelper   = new Write  ( g_session );
var ModifyMIsHelper = new ModifyMonitoredItemsHelper( g_session );