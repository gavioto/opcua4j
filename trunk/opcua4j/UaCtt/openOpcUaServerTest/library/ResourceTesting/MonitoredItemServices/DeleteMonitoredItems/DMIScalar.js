/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Creates a Subscription (default parameters);
        In a loop:
            (1) Call CreateMonitoredItems passing in all configured Static Scalar nodes.
            In a loop:
                (1) Call DeleteMonitoredItems passing in one Static Scalar Nodes at a time.
        Finally, deletes the Subscription and closes the connection.

    Settings used:
        /Server Test/NodeIds/Static/All Profiles/Scalar

    Revision History
        04-Jan-2010 NP: Initial version.
*/

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );

// this is the function that will be called repetitvely
function deleteMonitoredItemsScalarStatic()
{
    if( !createMonitoredItems( originalScalarItems, TimestampsToReturn.Both, testSubscription, g_session ) )
    {
        addError( "Could not CreateMonitoredItems. Skipping DeleteMonitoredItems call." );
    }
    else
    {
        for( i=0; i<originalScalarItems.length; i++ )
        {
            deleteMonitoredItems( originalScalarItems[i], testSubscription, g_session );
        }//for i
    }
}

function initialize()
{
    createSubscriptionResult = createSubscription( testSubscription, g_session );
    if( !createSubscriptionResult )
    {
        addError( "Skipping MONITOR VALUE CHANGE conformance unit, because createSubscription failed, which is a necessary function for testing this conformance unit." );
    }
}

function disconnectOverride()
{
//    deleteMonitoredItems( originalScalarItems, testSubscription, g_session );
    deleteSubscription( testSubscription, g_session );
    disconnect( g_channel, g_session );
}

// Get a list of items to read from settings
var originalScalarItems = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
if( originalScalarItems === null || originalScalarItems.length === 0 ){ return; }

// Set all items to be mode=Disabled
for( var i=0; i<originalScalarItems.length; i++ )
{
    originalScalarItems[i].MonitoringMode = MonitoringMode.Disabled;
}

// Create our Subscription 
var testSubscription = new Subscription();
var createSubscriptionResult;

// Create service call helper(s)
var CreateMIHelper;
var DeleteMIHelper;

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/MonitoredItemServicesCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( initialize, deleteMonitoredItemsScalarStatic, loopCount, undefined, disconnectOverride );

// clean-up
originalScalarItems = null;
CreateMIHelper = null;
DeleteMIHelper = null;