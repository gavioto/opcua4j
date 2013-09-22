/*  Test 5.10.4-012a prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Call Publish asynchronously, trying to invoke 5 concurrent publish requests.

    How this test works:
        1. connect to the Server; create a subscription; add monitoredItems (reporting).
        2. go into a loop: 
            a. issue X publishRequests (where X is a constant defined below, see PUBLISH_QUEUE_SIZE)
            b. go into a loop: 
                i.  issue publish calls while the outstanding # of requests are less than our max defined.
                ii. exit loop when number of callbacks exceed constant, see PUBLISH_CALLBACKS_NEEDED.
            c. go into a loop:
                i.  wait while the outstanding publish calls are received.
        3. disconnect.

        WARNING: THIS TEST CAN TAKE A LONG TIME TO COMPLETE.

    Revision History
        24/-May-2011 NP: Initial version.
*/

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );

const PUBLISH_QUEUE_SIZE = 5;
const PUBLISH_CALLBACKS_NEEDED = 10;

var numDataChangeNotifications = 0;
var numPublishRequests = 0;
var publishCounter = 0;
var subscription;

// define callback function
// call it however you like - the signature is mandatory
// first parameter is the service responce 
// second parameter is an object you can define however you want
function publishCallback( response, callbackData )
{
   numPublishRequests--;
   numDataChangeNotifications++;
}

function initialize()
{
    monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
    // create subscription
    subscription = new Subscription();
    //subscription
    if( !createSubscription( subscription, g_session ) )
    {
        addError( "Error creating subscription." );
        return;
    }
    createMonitoredItems( monitoredItems,  TimestampsToReturn.Both , subscription, g_session );

    // setup connection to callback
    // here we connect the signal "asyncCallComplete" of the session to a function in the script
    g_session.asyncCallComplete.connect( this, publishCallback );
}

function publishAsync()
{
    // set our variable values
    numDataChangeNotifications = 0;
    numPublishRequests = 0;
    publishCounter = 0
    // go into a loop: we want 20 callbacks, during this time ONLY queue a publish request 
    // if there's less than 10 publish calls outstanding...
    while( numDataChangeNotifications < PUBLISH_CALLBACKS_NEEDED )
    {
        // create new publish request
        if( numPublishRequests < PUBLISH_QUEUE_SIZE )
        {
            // queue publish request
            var publishRequest = new UaPublishRequest;
            g_session.buildRequestHeader( publishRequest.RequestHeader );
            numPublishRequests++;
            // just use the publish counter as callback data
            // we could also define any type of object and use that as callback data - now it's just a number
            g_session.beginPublish( publishRequest, publishCallback, publishCounter );
            print( "Publish called: " + publishCounter++ );
        }
        publishQueueIsFull = true;
    }

    // allow remaining Publish requests to come back...
    // clear the flag to stop the assertion (check outstanding publish calls = 10 );
    publishQueueIsFull = false;
    addLog( "Issued all Publish calls... now waiting for the outstanding calls to complete..." );
    while( numPublishRequests > 0 )
    {
        // small delay so as to prevent CPU overload; also prevent thread-block.
        wait( 100 );
    }
}

function disconnectOverride()
{
    // small delay and then clean-up
    wait( 2000 );
    deleteMonitoredItems( monitoredItems, subscription, g_session );
    deleteSubscription( subscription, g_session );
    disconnect( g_channel, g_session );
}

var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/SubscriptionServiceSetCallCount" ).toString() );

// Perform the iterative call loop
const TIMEOUT_OVERRIDE = true;
repetitivelyInvoke( initialize, publishAsync, loopCount, undefined, disconnectOverride, TIMEOUT_OVERRIDE );

// clean-up
originalScalarItems = null;
SetMonitoringHelper = null;