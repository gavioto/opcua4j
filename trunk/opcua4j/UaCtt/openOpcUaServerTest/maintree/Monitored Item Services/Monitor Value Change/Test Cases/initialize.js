// Testing functions
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/basicCreateMonitoredItemsTest.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItemsTestQueue.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/writeToDeadbandAndCheckWithPublish.js" );
// Objects
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/Objects/event.js" );
include( "./library/Base/array.js" );
// utility functions
include( "./library/Base/connect.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/indexRangeRelatedUtilities.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
// include all library scripts specific to monitored items tests
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
// ModifyMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/ModifyMonitoredItems/modifyMonitoredItems.js" );
// SetMonitoringMode
include( "./library/ServiceBased/MonitoredItemServiceSet/SetMonitoringMode/setMonitoringMode.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
// Publish
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
// DeleteSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
// SetTriggering
include( "./library/ServiceBased/MonitoredItemServiceSet/SetTriggering/setTriggering.js" );
// Read
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
// Write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );


// Connect to the server 
var g_channel = new UaChannel();
var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );

var originalScalarItems = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic().concat( NodeIdSettings.ArraysStatic() ) );
if( originalScalarItems === null || originalScalarItems.length === 0 )
{
    addWarning( "Not enough Scalar Static nodes configured. Aborting conformance unit." );
    stopCurrentUnit();
}

if( !connect( g_channel, g_session ) )
{
    addError( "Connect failed. Stopping execution of current conformance unit." );
    stopCurrentUnit();
}

// create a subscription that can be used for all tests in this conformance unit
var MonitorBasicSubscription = new Subscription();
if( !createSubscription( MonitorBasicSubscription, g_session ) )
{
    addError( "Skipping MONITOR VALUE CHANGE conformance unit, because createSubscription failed, which is a necessary function for testing this conformance unit." );
    stopCurrentUnit();
}

// create some Service helpers
var ReadHelper        = new Read   ( g_session );
var WriteHelper       = new Write  ( g_session );
var PublishHelper     = new Publish( g_session, MonitorBasicSubscription.TimeoutHint );
var SetMonitoringModeHelper = new SetMonitoringMode( g_session );


if( !ReadHelper.Execute( originalScalarItems ) )
{
    addError( "Could not read the initial values of the Scalar nodes we want to test." );
//    stopCurrentUnit();
}
else
{
    // store the original values
    for( var i=0; i<originalScalarItems.length; i++ )
    {
        originalScalarItems[i].OriginalValue = originalScalarItems[i].Value.Value.clone();
    }
}

print( "\n\n\n\n\n***** START OF CONFORMANCE UNIT TESTING *****" );

function revertOriginalValuesScalarStatic()
{
    // restore the original values
    addLog( "Reverting Scalar Static nodes to their original values." );
    var expectedResults = [];
    var numWrites = 0;
    for( var i=0; i<originalScalarItems.length; i++ )
    {
        // did we capture an initial value? if so then revert to it
        if( originalScalarItems[i].OriginalValue !== undefined && originalScalarItems[i].OriginalValue !== null )
        {
            originalScalarItems[i].Value.Value = originalScalarItems[i].OriginalValue.clone();
            expectedResults[i] = new ExpectedAndAcceptedResults( StatusCode.Good );
            expectedResults[i].addAcceptedResult( StatusCode.BadNotWritable )
            numWrites++;
        }
        else
        {
            print( "\tCannot revert to original value on Node '" + originalScalarItems[i].NodeSetting + "' because it wasn't captured in the beginning (bad data? invalid nodes?)" );
        }
    }
    // do we have anything to revert?
    if( numWrites > 0 )
    {
        WriteHelper.Execute( originalScalarItems, expectedResults, true, true, true );
    }
}