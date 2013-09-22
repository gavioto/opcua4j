/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Creates a Subscription (default parameters);
        In a loop:
            (1) Call CreateMonitoredItems passing in all configured Static Scalar nodes.
            (2) Call DeleteMonitoredItems passing in same Static Scalar Nodes, monitoringMode = Disabled.
        Finally, deletes the Subscription and closes the connection.

    Settings used:
        /Server Test/NodeIds/Static/All Profiles/Scalar

    Configurable Script Options:
      DELETEMONITOREDITEMS_AFTER_EACH_CREATEMONITOREDITEMS

    Revision History
        04-Jan-2010 NP: Initial version.
*/

const DELETEMONITOREDITEMS_AFTER_EACH_CREATEMONITOREDITEMS = true;

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );

// this is the function that will be called repetitvely
function createMonitoredItemsScalarStatic()
{
    if( !createMonitoredItems( originalScalarItems, TimestampsToReturn.Both, testSubscription, g_session, undefined, undefined, true ) )
    {
        addError( "Could not CreateMonitoredItems. Skipping DeleteMonitoredItems call." );
    }
    else
    {
        if( DELETEMONITOREDITEMS_AFTER_EACH_CREATEMONITOREDITEMS === true )
        {
            deleteMonitoredItems( originalScalarItems, testSubscription, g_session, undefined, undefined, true );
        }
        else
        {
            print( "**** Skipping DeleteMonitoredItems, per script variable 'DELETEMONITOREDITEMS_AFTER_EACH_CREATEMONITOREDITEMS' ****" );
        }
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
    if( false === DELETEMONITOREDITEMS_AFTER_EACH_CREATEMONITOREDITEMS )
    {
        print( "**** Calling DeleteMonitoredItems, now that Testing is complete ****" );
        deleteMonitoredItems( originalScalarItems, testSubscription, g_session );
    }
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

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/MonitoredItemServicesCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( initialize, createMonitoredItemsScalarStatic, loopCount, undefined, disconnectOverride, undefined, "CreateMonitoredItems, Scalar - Disabled" );

// clean-up
originalScalarItems = null;