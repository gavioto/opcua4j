// General includes
include( "./library/Base/assertions.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
include( "./library/Base/connect.js" );
include( "./library/Base/disconnect.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/event.js" );
include( "./library/ClassBased/UaQualifiedName/create_qualified_name.js" );
include( "./library/ClassBased/UaNodeId/create_nodeid.js" );
include( "./library/NodeTypeBased/DataItemType/precision.js" );
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
// Read 
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
//Publish
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
// Write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
// Browse
include( "./library/ServiceBased/ViewServiceSet/Browse/get_default_request.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/assert_browse_valid.js" );
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/create_request.js" );
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/check_translateBrowsePathsToNodeIds_valid.js");
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/check_translateBrowsePathsToNodeIds_error.js");
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/check_translateBrowsePathsToNodeIds_failed.js");
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/getNodeIds.js");

// Connect to the server
var g_channel = new UaChannel();
var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );

if( !connect( g_channel, g_session ) )
{
    addError( "Connect()" );
    stopCurrentUnit();
}

// some Helper methods that can be used by all scripts within the Conformance Unit.
var PublishHelper = new Publish( g_session );
var WriteHelper   = new Write  ( g_session );
var ReadHelper    = new Read   ( g_session );