/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Creates 10 Subscriptions (default parameters);
        Call CreateMonitoredItems passing in all configured Static Scalar nodes.
        In a loop:
            1. Modify the first 5 Subscription's mode: 
                Enabled -> Disabled -> Enabled etc.
        Finally call DeleteMonitoredItems, delete all Subscriptions and close the connection.

    Settings used:
        /Server Test/NodeIds/Static/All Profiles/Scalar

    Test Parameters:
        MAX_SUBSCRIPTIONS:    Controls how many subscriptions to create.
        MONITOREDITEM_MODE:   The Mode of the monitoredItem, i.e. Disabled, Reporting, Sampling.

    Revision History
        06-Jan-2010 NP: Initial version.
*/

const MAX_SUBSCRIPTIONS = 10;
const MONITOREDITEM_MODE = MonitoringMode.Disabled;

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/setPublishingMode.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );

// this is the function that will be called repetitvely
function setPublishingModeSingleSub()
{
    // toggle publishing Enabled
    currentMode = !currentMode;
    // invoke the call to change the publishInterval
    SetPubModeHelper.Execute( firstFiveSubscriptions, currentMode );
}

function initialize()
{
    for( i=0; i<MAX_SUBSCRIPTIONS; i++ )
    {
        var newSub = new Subscription();
        if( createSubscription( newSub, g_session ) )
        {
            // clone the monitoredItems (each will go into own subscription and get own handle
            var newSubMIs = MonitoredItem.Clone( originalScalarItems );
            createMonitoredItems( newSubMIs, TimestampsToReturn.Both, newSub, g_session );
            testSubscriptions.push( newSub );
            allMonitoredItems.push( newSubMIs );
        }
    }
    // store the first 5 subsc in a separate collection for easier coding in our loop function (above)
    if( testSubscriptions.length > 5 )
    {
        for( i=0; i<5; i++ )
        {
            firstFiveSubscriptions[i] = testSubscriptions[i];
        }
    }
    else
    {
        firstFiveSubscriptions = testSubscriptions;
    }
    SetPubModeHelper = new SetPublishingMode( g_session );
}

function disconnectOverride()
{
    while( testSubscriptions.length > 0 )
    {
        var currSub = testSubscriptions.shift();
        var currMIs = allMonitoredItems.shift();
        deleteMonitoredItems( currMIs, currSub, g_session );
        deleteSubscription( currSub, g_session );
    }
    disconnect( g_channel, g_session );
}

// Get a list of items to read from settings
var originalScalarItems = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
if( originalScalarItems === null || originalScalarItems.length === 0 ){ return; }

// A collection for ALL monitoredItems that will exist for ALL subscriptions
var allMonitoredItems = [];

// Set all items to be mode=Disabled
for( var i=0; i<originalScalarItems.length; i++ )
{
    originalScalarItems[i].MonitoringMode = MONITOREDITEM_MODE;
}

// Create our Subscription 
var testSubscriptions = [];
var firstFiveSubscriptions = [];
var currentMode = !Subscription.PublishingEnabled;

// Create service call helper(s)
var SetPubModeHelper;

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/MonitoredItemServicesCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( initialize, setPublishingModeSingleSub, loopCount, undefined, disconnectOverride );

// clean-up
originalScalarItems = null;
allMonitoredItems = null;
firstFiveSubscriptions = null;
SetPubModeHelper = null;