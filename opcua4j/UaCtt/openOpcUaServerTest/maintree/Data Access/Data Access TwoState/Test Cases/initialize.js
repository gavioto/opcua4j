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
include( "./library/NodeTypeBased/AnalogItemType/TrueStateFalseState.js" );
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
// Publish
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
// Read
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
// Write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
// Browse
include( "./library/ServiceBased/ViewServiceSet/Browse/assert_browse_valid.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/get_references.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/direction_test.js" );


// check we have enough settings for TwoStateDiscrete
var twoStateItems = MonitoredItem.fromSettings( NodeIdSettings.DAStaticTwoStateDiscreteItems() );
if( twoStateItems == null || twoStateItems.length == 0)
{
    _dataTypeUnavailable.store( "TwoStateDiscreteItems" );
}

// check we have enough settings for MultiStateDiscrete
var multiStateItems = MonitoredItem.fromSettings( NodeIdSettings.DAStaticMultiStateDiscreteItems() );
if( multiStateItems == null || multiStateItems.length == 0)
{
    _dataTypeUnavailable.store( "MultiStateDiscreteItems" );
}

// check we have enough settings for Discrete testing?
if( ( multiStateItems == null || multiStateItems.length == 0 )
    && ( twoStateItems == null || twoStateItems.length == 0 ) )
{
    addWarning( "Not enough DiscreteTypes defined. Aborting tests in this conformance unit." );
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

// helper objects that we'll make use of in this conformance unit
var ReadHelper    = new Read( g_session );
var WriteHelper   = new Write( g_session );
var PublishHelper = new Publish( g_session );

const TSDT = "TwoStateDiscreteType";