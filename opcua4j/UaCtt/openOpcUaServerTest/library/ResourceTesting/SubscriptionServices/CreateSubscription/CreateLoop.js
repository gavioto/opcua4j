/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        In a loop: 
            Creates a Subscription (default parameters);
        Upon failure, all subscriptions are deleted and the test starts over.
        Finally call DeleteSubscription's and close the connection.

    Revision History
        06-Jan-2010 NP: Initial version.
*/

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );

// this is the function that will be called repetitvely
function createSubscriptions()
{
    // create a new subscription and then try to Create it at the UA Server
    var newSub = new Subscription();
    // if the subscription is created then add it to our collection, otherwise
    // delete everything we have created so that this test can start over.
    if( !createSubscription( newSub, g_session ) )
    {
        while( testSubscriptions.length > 0 )
        {
            var currSub = testSubscriptions.shift();
            deleteSubscription( currSub, g_session );
        }// while
    }
    else
    {
        testSubscriptions.push( newSub );
    }
}

function disconnectOverride()
{
    while( testSubscriptions.length > 0 )
    {
        var currSub = testSubscriptions.shift();
        deleteSubscription( currSub, g_session );
    }// while
    disconnect( g_channel, g_session );
}

// Create our Subscription 
var testSubscriptions = [];

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/SubscriptionServiceSetCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( null, createSubscriptions, loopCount, null, disconnectOverride );