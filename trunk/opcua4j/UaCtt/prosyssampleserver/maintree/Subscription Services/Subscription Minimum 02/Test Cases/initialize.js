// Objects
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/array.js" );
// utility functions
include( "./library/Base/connect.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/check_timestamp.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/multiSessionMultiSubscribeTest.js" );
// ModifySubscription
include( "./library/ServiceBased/SubscriptionServiceSet/ModifySubscription/modifySubscription.js" );
// SetPublishingMode
include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/setPublishingMode.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/testParallelSubscriptions.js" );
// Publish
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
// Republish
include( "./library/ServiceBased/SubscriptionServiceSet/Republish/check_republish_valid.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/Republish/check_republish_failed.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
// write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );


// Some variables to help these scripts

// setup a default monitoredItem that we can use for the scripts within this CU.
var monitoredItem;
function InitSubscriptionMin2()
{
    const MONITOREDITEM_SETTING = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( MONITOREDITEM_SETTING === undefined || MONITOREDITEM_SETTING === null )
    {
        addWarning( "Not numeric nodes configured. Aborting conformance unit testing." );
        stopCurrentUnit();
    }
    monitoredItem = MonitoredItem.fromSetting( MONITOREDITEM_SETTING.name, 0 );
    if( monitoredItem === undefined || monitoredItem === null )
    {
        addError( "NODE SETTING NOT CONFIGURED! Please check setting '" + MONITOREDITEM_SETTING + "'" );
        stopCurrentUnit();
    }
    monitoredItem.DataType = NodeIdSettings.guessType( monitoredItem.NodeSetting );
}
InitSubscriptionMin2();

// Connect to the server 
var g_channel = new UaChannel();
var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
if( !connect( g_channel, g_session ) )
{
    addError( "Connect failed. Stopping execution of current conformance unit.");
    stopCurrentUnit();
}

var writeService = new Write( g_session );
var readService  = new Read ( g_session );