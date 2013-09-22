/*  Test 5.10.5 Error case 3 prepared by Matthias Isele; matthias.isele@ascolab.com
    Description:
        Republish using an invalid subscriptionId
        Expected Result: Bad_SubscriptionIdInvalid

    Revision History:
        14-Aug-2009 MI: Initial version.
        24-Nov-2009 NP: REVIEWED.
*/

function republish5105Err003()
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

    // call publish to get the first sequence number
    if( !publishService.Execute() )
    {
        deleteSubscription( subscription );
        return;
    }

    // call republish with the sequence number received above
    var republishRequest = new UaRepublishRequest();
    var republishResponse = new UaRepublishResponse();
    g_session.buildRequestHeader( republishRequest.RequestHeader );
    
    republishRequest.RetransmitSequenceNumber = publishService.ReceivedSequenceNumbers.pop();
    republishRequest.SubscriptionId = Constants.Int32_Max;

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
    deleteMonitoredItems( monitoredItems, subscription, g_session );
    deleteSubscription( subscription, g_session );
    publishService.Clear();
}

safelyInvoke( republish5105Err003 );