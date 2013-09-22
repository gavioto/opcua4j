/*  Test 5.10.5 Error Test 7 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Republish on a subscription that was previously deleted.
        Expected result: Bad_SubscriptionIdInvalid

    Revision History:
        24-Nov-2009 NP: Initial Version.
                        REVIEWED.
*/

function republish5105Err007()
{
    var i;

    // create subscription    
    var subscription = new Subscription();
    createSubscription( subscription, g_session );

    // create monitored items
    var monitoredItems = [];
    var clientHandle = 0;
    monitoredItems[0] = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("iud").name );
    monitoredItems[1] = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("udi").name );

    if( monitoredItems[0] === null || monitoredItems[1] === null )
    {
        addSkipped( "Static Scalar - 2 Nodes needed" );
        return;
    }

    if( !createMonitoredItems( monitoredItems, TimestampsToReturn.Both, subscription, g_session ) )
    {
        return;
    }

    wait( subscription.RevisedPublishingInterval );

    // call publish to get the first sequence number
    if( !publishService.Execute() )
    {
        deleteMonitoredItems( monitoredItems, subscription, g_session );
        deleteSubscription( subscription, g_session );
        return;
    }
    else
    {
        // now delete the subscription now that we know that it WAS a
        // living/breathing subscription
        deleteMonitoredItems( monitoredItems, subscription, g_session );
        deleteSubscription( subscription, g_session );
    }

    // call republish with the sequence number received above
    var republishRequest = new UaRepublishRequest();
    var republishResponse = new UaRepublishResponse();
    g_session.buildRequestHeader( republishRequest.RequestHeader );

    republishRequest.RetransmitSequenceNumber = publishService.ReceivedSequenceNumbers.pop(); // last one acknowledged
    republishRequest.SubscriptionId = subscription.SubscriptionId;

    print( "\nCalling Republish:\n\tSubscription: " + republishRequest.SubscriptionId + "\n\tSequence: " + republishRequest.RetransmitSequenceNumber );
    uaStatus = g_session.republish( republishRequest, republishResponse );
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
        checkRepublishFailed( republishRequest, republishResponse, expectedServiceResult );
    }
    else
    {
        addError( "RePublish() status " + uaStatus, uaStatus );
    }

    // clean-up
    deleteSubscription( subscription, g_session );
    publishService.Clear();
}

safelyInvoke( republish5105Err007 );