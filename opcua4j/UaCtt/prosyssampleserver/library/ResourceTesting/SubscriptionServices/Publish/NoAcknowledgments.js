/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Creates a Subscription (default parameters);
        Call CreateMonitoredItems passing in all configured Dynamic Scalar nodes.
        In a loop:
            (1) Call Publish, do not acknowledge any dataChanges and/or Events
        Finally, DeleteMonitoredItems and also the Subscription and closes the connection.

    Settings used:
        /Server Test/NodeIds/Static/All Profiles/Scalar

    Parameters for tweaking test:
        SKIP_ACKNOWLEDGE   - False=acknowledge all dataChanges/events; True=no acknowledgements.
        ACKNOWLEDGE_AT_END - True=acknowledge any unacknowledged dataChanges/events at the end of the test.

    Revision History
        04-Jan-2010 NP: Initial version.
*/

const SKIP_ACKNOWLEDGE = true;
const ACKNOWLEDGE_AT_END = true;

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );

// this is the function that will be called repetitvely
function publishNoAck()
{
    PublishHelper.Execute( SKIP_ACKNOWLEDGE );
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
    PublishHelper = new Publish( g_session );
}

function disconnectOverride()
{
    // do we need to acknowledge everything prior to disconnect?
    if( ACKNOWLEDGE_AT_END )
    {
        PublishHelper.Execute();
    }
    deleteMonitoredItems( originalScalarItems, testSubscription, g_session );
    deleteSubscription( testSubscription, g_session );
    disconnect( g_channel, g_session );
}

// Get a list of items to read from settings
var originalScalarItems = MonitoredItem.fromSettings( NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" ).name() );
if( originalScalarItems === null || originalScalarItems.length === 0 ){ return; }

// Setup our monitoringMode value 
var currentMonitoringMode = MonitoringMode.Disabled;

// Set all items to be mode=Disabled
for( var i=0; i<originalScalarItems.length; i++ )
{
    originalScalarItems[i].MonitoringMode = currentMonitoringMode;
}

// Create our Subscription 
var testSubscription = new Subscription();
var createSubscriptionResult;

// Create service call helper(s)
var PublishHelper;

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/SubscriptionServiceSetCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( initialize, publishNoAck, loopCount, undefined, disconnectOverride );

// clean-up
originalScalarItems = null;
SetMonitoringHelper = null;