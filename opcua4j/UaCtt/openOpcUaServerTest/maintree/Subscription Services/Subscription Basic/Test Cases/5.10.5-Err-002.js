/*  Test 5.10.5 Error Test 2 prepared by Anand Taparia; ataparia@kepwaare.com
    Description:
        Script calls republish with subscriptionId equal to 0.

    Revision History
        21-Sep-2009 AT: Initial version.
        24-Nov-2009 NP: REVIEWED.
*/

function republish5105Err002()
{
    var i;
    
    // create subscription    
    var subscription = new Subscription();
    createSubscription( subscription, g_session );
    
    // create monitored items
    var MonitoredItems = [];
    var clientHandle = 0;
    MonitoredItems[0] = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("iud").name );
    MonitoredItems[1] = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("udi").name );

    if( MonitoredItems[0] === null || MonitoredItems[1] === null )
    {
        addSkipped( "Static Scalar - 2 Nodes needed" );
        return;
    }

    if( !createMonitoredItems( MonitoredItems, TimestampsToReturn.Both, subscription, g_session ) )
    {
        return;
    }

    // call publish to get the first sequence number
    wait( subscription.RevisedPublishingInterval );
    if( !publishService.Execute() )
    {
        deleteSubscription( subscription );
        return;
    }

    // call republish with the sequence number received above
    var republishRequest = new UaRepublishRequest();
    var republishResponse = new UaRepublishResponse();
    g_session.buildRequestHeader( republishRequest.RequestHeader );

    republishRequest.RetransmitSequenceNumber = publishService.ReceivedSequenceNumbers.pop(); // last one in list!
    republishRequest.SubscriptionId = 0;

    uaStatus = g_session.republish( republishRequest, republishResponse );
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new  ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
        checkRepublishFailed( republishRequest, republishResponse, expectedServiceResult );
    }
    else
    {
        addError( "RePublish() status " + uaStatus, uaStatus );
    }

    // clean-up
    deleteMonitoredItems( MonitoredItems, subscription, g_session );
    deleteSubscription( subscription, g_session );
    publishService.Clear();
}

safelyInvoke( republish5105Err002 );