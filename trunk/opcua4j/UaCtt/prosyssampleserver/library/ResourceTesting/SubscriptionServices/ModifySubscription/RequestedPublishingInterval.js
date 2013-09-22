/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Creates a Subscription (default parameters);
        Call CreateMonitoredItems passing in all configured Static Scalar nodes.
        In a loop:
            1. Modify the RequestedPublishingInterval: 
                10 -> 100-> 1000-> 10 etc.
        Finally call DeleteMonitoredItems, delete the Subscription and close the connection.

    Settings used:
        /Server Test/NodeIds/Static/All Profiles/Scalar

    Revision History
        06-Jan-2010 NP: Initial version.
*/

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/ModifySubscription/modifySubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );

const PUBLISHINTERVAL_SMALL  = 10;
const PUBLISHINTERVAL_MEDIUM = 100;
const PUBLISHINTERVAL_LARGE  = 1000;

// this is the function that will be called repetitvely
function modifySubscriptionRequestedPublishingInterval()
{
    // change the value of the currentMode parameter
    switch( testSubscription.RequestedPublishingInterval )
    {
        case PUBLISHINTERVAL_SMALL:  testSubscription.RequestedPublishingInterval = PUBLISHINTERVAL_MEDIUM; break;
        case PUBLISHINTERVAL_MEDIUM: testSubscription.RequestedPublishingInterval = PUBLISHINTERVAL_LARGE;  break;
        case PUBLISHINTERVAL_LARGE:  testSubscription.RequestedPublishingInterval = PUBLISHINTERVAL_SMALL;  break;
    }
    
    // invoke the call to change the publishInterval
    ModifySubHelper.Execute( testSubscription );
}

function initialize()
{
    createSubscriptionResult = createSubscription( testSubscription, g_session );
    if( !createSubscriptionResult )
    {
        return;
    }
    if( !createMonitoredItems( originalScalarItems, TimestampsToReturn.Both, testSubscription, g_session ) )
    {
        return;
    }
    ModifySubHelper = new ModifySubscription( g_session );
}

function disconnectOverride()
{
    deleteMonitoredItems( originalScalarItems, testSubscription, g_session );
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

// Create service call helper(s)
var ModifySubHelper;

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/MonitoredItemServicesCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( initialize, modifySubscriptionRequestedPublishingInterval, loopCount, undefined, disconnectOverride );

// clean-up
originalScalarItems = null;
ModifySubHelper = null;