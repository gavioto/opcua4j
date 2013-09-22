/*  Test 5.10.4-013a prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Call Publish asynchronously, trying to invoke 10 concurrent publish requests.

    Revision History
        24/-May-2011 NP: Initial version.
*/

const PUBLISH_QUEUE_SIZE = 10;
const PUBLISH_CALLBACKS_NEEDED = 15;

var publishQueueIsFull = false;
var numDataChangeNotifications = 0;
var numPublishRequests = 0;
var publishCounter = 0;

// define callback object
function CallbackObject()
{
    this.handleCallbackFunction = function( response, callbackData )
    {
        addLog( "Response " + response );
        addLog( "CallbackData " + callbackData );
    }
}

// define callback function
// call it however you like - the signature is mandatory
// first parameter is the service responce 
// second parameter is an object you can define however you want
function publishCallback( response, callbackData )
{
    // add this response to our publish helper, if data is present
    var callbacksNeeded = ( PUBLISH_CALLBACKS_NEEDED - numDataChangeNotifications );
    addLog( "Publish Callback! call # " + callbackData + "; Outstanding (waiting) Publish requests: " + numPublishRequests + "; Callbacks remaining for test: " + ( callbacksNeeded > 0? callbacksNeeded : 0 ) );
    if( publishQueueIsFull )
    {
        // allow a +/- of 1 because we may query the queue size during the transition of one item being dequeued and another queued...
        AssertInRange( (PUBLISH_QUEUE_SIZE-1), PUBLISH_QUEUE_SIZE, numPublishRequests, "Expecting the Server to queue " + PUBLISH_QUEUE_SIZE + " Publish notifications." );
    }
    if( response.NotificationMessage.NotificationData.size > 0 )
    {
        // cast message to dataChange, if applicable
        var dataChangeEvent = response.NotificationMessage.NotificationData[0].toDataChangeNotification();
        if( dataChangeEvent !== undefined && dataChangeEvent !== null )
        {
            addLog( "Publish callback: " + Publish.PrintDataChange( dataChangeEvent, true ) ); // PrintDataChange() is a static method on the Publish [script] object.
        }
    }
    else
    {
        addLog( "\tkeep-alive." );
    }
   numPublishRequests--;
   numDataChangeNotifications++;
}


function asyncPublish5104013a()
{
    monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );

    // create subscription
    var subscription = new Subscription();
    //subscription
    if( !createSubscription( subscription, g_session ) )
    {
        addError( "Error creating subscription." );
    }
    else
    {
        createMonitoredItems( monitoredItems,  TimestampsToReturn.Both , subscription, g_session );

        // setup connection to callback
        // here we connect the signal "asyncCallComplete" of the session to a function in the script
        g_session.asyncCallComplete.connect( this, publishCallback );

        // we will modify the call timeout settings to take into consideration the last 
        // publish request in the queue to prevent it from timing out.
        var timeoutHintSettingValue = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ).toString(), 10 );
        print( "Default timeout setting: " + timeoutHintSettingValue + "; multiplying by 10." );
        timeoutHintSettingValue *= 10;

        // go into a loop: we want 20 callbacks, during this time ONLY queue a publish request 
        // if there's less than 10 publish calls outstanding...
        // allow a max of 1 minute for this test to execute
        var timeExpires = UaDateTime.utcNow();
        timeExpires.addSeconds( 60 );
        while( numDataChangeNotifications < PUBLISH_CALLBACKS_NEEDED )
        {
            // exit loop for taking too long?
            if( timeExpires < UaDateTime.utcNow() )
            {
                addWarning( "Exiting loop early. Test taking too long. Waited 60 seconds." );
                break;
            }
            // create new publish request
            if( numPublishRequests < PUBLISH_QUEUE_SIZE )
            {
                // queue publish request
                var publishRequest = new UaPublishRequest;
                g_session.buildRequestHeader( publishRequest.RequestHeader );
                publishRequest.RequestHeader.TimeoutHint = timeoutHintSettingValue;
                numPublishRequests++;
                // just use the publish counter as callback data
                // we could also define any type of object and use that as callback data - now it's just a number
                g_session.beginPublish( publishRequest, publishCallback, publishCounter );
                print( "Publish called: " + publishCounter++ );
            }
            else
            {
                publishQueueIsFull = true;
            }
            wait( 10 ); // prevent CPU race
        }

        // allow remaining Publish requests to come back...
        // clear the flag to stop the assertion (check outstanding publish calls = 10 );
        publishQueueIsFull = false;
        addLog( "Issued all Publish calls... now waiting for the outstanding calls to complete... or a max of 60 seconds to pass." );
        timeExpires = UaDateTime.utcNow();
        timeExpires.addSeconds( 60 );
        while( numPublishRequests > 0 )
        {
            // exit loop for taking too long?
            if( timeExpires < UaDateTime.utcNow() )
            {
                addWarning( "Exiting loop early. Test taking too long. Waited 60 seconds." );
                break;
            }
            // small delay so as to prevent CPU overload; also prevent thread-block.
            wait( 10 );
        }
        
        g_session.asyncCallComplete.disconnect( this, publishCallback );

        // small delay and then clean-up
        wait( 2000 );
        deleteMonitoredItems( monitoredItems, subscription, g_session );
        deleteSubscription( subscription, g_session );

        // did we receive all callbacks?
        AssertGreaterThan( (PUBLISH_CALLBACKS_NEEDED - 1), numDataChangeNotifications, "Did not receive the expected number of Publish responses." );
    }
}

safelyInvoke( asyncPublish5104013a );