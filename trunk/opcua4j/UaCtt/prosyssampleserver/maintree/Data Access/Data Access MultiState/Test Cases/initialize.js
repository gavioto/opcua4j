// General includes
include( "./library/Base/assertions.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
include( "./library/Base/connect.js" );
include( "./library/Base/disconnect.js" );
include( "./library/Base/safeInvoke.js" );
// Reference type includes
include( "./library/NodeTypeBased/AnalogItemType/MultiStateDiscreteType.js" );
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
//Publish
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
// Read 
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
// Write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
// Browse
include( "./library/ServiceBased/ViewServiceSet/Browse/assert_browse_valid.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/get_references.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/direction_test.js" );

// check if we have enough settings to proceed with testing this conformance unit
var multiStateItems = MonitoredItem.fromSettings( NodeIdSettings.DAStaticMultiStateDiscreteItems() );
if( multiStateItems == null || multiStateItems.length == 0 )
{
    _dataTypeUnavailable.store( "Static MultiStateDiscreteItems" );
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

var PublishHelper = new Publish( g_session );
var ReadHelper  = new Read( g_session );
var WriteHelper = new Write( g_session );