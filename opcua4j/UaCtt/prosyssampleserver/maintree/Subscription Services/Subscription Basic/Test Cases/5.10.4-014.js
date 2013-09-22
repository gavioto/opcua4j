/*  Test 5.10.4 Test 14, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Acknowledge a sequenceNumber of 0.

        Results expected as follows:
            Service result is Good, Operation level result is Bad_SequenceNumberInvalid.

    Revision History
        19-Nov-2009 NP: Initial version.
        19-Nov-2009 NP: REVIEWED.
        22-Mar-2010 NP: Added "TimeoutHint" selection to the Publish header.
        07-Feb-2011 MI: Add expected result BadSequenceNumberUnknown.
*/

function publish5104014()
{
    var sequenceNumbers = [];     // sequence numbers to store for acknowledging
    var subscriptionIds = [];     // subscriptionIds that correspond to the sequenceNumbers
    var subscription = new Subscription();

    if( !createSubscription( subscription, g_session ) )
    {
        return;
    }

    // step 2 - adding some items to subscribe to (monitor).
    // define the monitored items and then make the call to monitor them!
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0 )

    // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
    if( !createMonitoredItems( items, TimestampsToReturn.Both, subscription, g_session ) )
    {
        deleteSubscription( subscription, g_session );
        return;
    }

    // allow a few seconds for the server to start the subscriptions
    addLog( "Wait for '" + subscription.RevisedPublishingInterval + " msecs' to allow server to actively start polling the subscribed items..." );
    wait( subscription.RevisedPublishingInterval );



// --------------------------------------------------------------------------
    // step #2 - publish call, ack an invalid sequenceNumber
    var expectedErrors = [ new ExpectedAndAcceptedResults( StatusCode.BadSequenceNumberUnknown ) ];
    expectedErrors[0].addAcceptedResult( StatusCode.BadSequenceNumberInvalid );
    var publishRequest = new UaPublishRequest();
    var publishResponse = new UaPublishResponse();
    g_session.buildRequestHeader( publishRequest.RequestHeader );
    publishRequest.RequestHeader.TimeoutRequest = subscription.TimeoutHint;

    publishRequest.SubscriptionAcknowledgements[0].SubscriptionId = subscription.SubscriptionId;
    publishRequest.SubscriptionAcknowledgements[0].SequenceNumber = 0;

    // go ahead and issue the PUBLISH call.... and then validate the response.
    var uaStatus = g_session.publish( publishRequest, publishResponse );
    if( uaStatus.isGood() )
    {
        // do the final check which we expect to contain some errors
        checkPublishError( publishRequest, publishResponse, expectedErrors );
        // add "deprecated" message if BadSequenceNumberInvalid was found
        if( publishResponse.Results[0].StatusCode == StatusCode.BadSequenceNumberInvalid )
        {
            addWarning( "The Bad_SequenceNumberInvalid return code has been deprecated, use Bad_SequenceNumberUnknown instead." );
        }
    }
    else
    {
        addError( "Publish() status " + uaStatus, uaStatus );
    }//if..else...

    //Now Delete the MonitoredItems
    deleteMonitoredItems( items, subscription, g_session );
    // delete the subscription we added here 
    deleteSubscription( subscription, g_session );
}

safelyInvoke( publish5104014 );