/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Creates a Subscription (default parameters);
        Call CreateMonitoredItems passing in all configured Static Scalar nodes.
        In a loop:
            1. Modify all monitoredItems by changing the TimestampsToReturn to the "next" timestamp:
                None -> Server -> Source -> Both -> None etc.
        Finally call DeleteMonitoredItems, delete the Subscription and close the connection.

    Settings used:
        /Server Test/NodeIds/Static/All Profiles/Scalar

    Configurable Script Options:
      DELETEMONITOREDITEMS_AFTER_EACH_CREATEMONITOREDITEMS

    Revision History
        05-Jan-2010 NP: Initial version.
*/

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/ModifyMonitoredItems/modifyMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );

// this is the function that will be called repetitvely
function modifyMonitoredItemsTimestamptsToReturn()
{
    // change the value of the currentMode parameter
    switch( currentTimestamp )
    {
        case TimestampsToReturn.Neither:currentTimestamp = TimestampsToReturn.Server; break;
        case TimestampsToReturn.Server: currentTimestamp = TimestampsToReturn.Source; break;
        case TimestampsToReturn.Source: currentTimestamp = TimestampsToReturn.Both;   break;
        case TimestampsToReturn.Both:   currentTimestamp = TimestampsToReturn.Neither;break;
    }
    // invoke the call to change the monitoringMode
    ModifyMIHelper.Execute( originalScalarItems, currentTimestamp, testSubscription, undefined, undefined, true );
}

function initialize()
{
    createSubscriptionResult = createSubscription( testSubscription, g_session );
    if( !createSubscriptionResult )
    {
        return;
    }
    if( !createMonitoredItems( originalScalarItems, TimestampsToReturn.Both, testSubscription, g_session, undefined, undefined, true ) )
    {
        return;
    }
    ModifyMIHelper = new ModifyMonitoredItemsHelper( g_session );
}

function disconnectOverride()
{
    deleteMonitoredItems( originalScalarItems, testSubscription, g_session, undefined, undefined, true );
    deleteSubscription( testSubscription, g_session );
    disconnect( g_channel, g_session );
}

// Get a list of items to read from settings
var originalScalarItems = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
if( originalScalarItems === null || originalScalarItems.length === 0 ){ return; }

// Setup our timestamp value 
var currentTimestamp = TimestampsToReturn.Neither;

// Set all items to be mode=Disabled
for( var i=0; i<originalScalarItems.length; i++ )
{
    originalScalarItems[i].MonitoringMode = MonitoringMode.Disabled;
}

// Create our Subscription 
var testSubscription = new Subscription();
var createSubscriptionResult;

// Create service call helper(s)
var ModifyMIHelper;

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/MonitoredItemServicesCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( initialize, modifyMonitoredItemsTimestamptsToReturn, loopCount, undefined, disconnectOverride, undefined, "ModifyMonitoredItems, TimestampsToReturn" );

// clean-up
originalScalarItems = null;
ModifyMIHelper = null;