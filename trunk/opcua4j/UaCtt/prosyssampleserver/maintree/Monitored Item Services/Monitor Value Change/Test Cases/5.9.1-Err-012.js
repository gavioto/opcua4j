/*  Test 5.9.1 Error Test 12 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies an invalid IndexRange outside the bounds of the array item.
        for an array item.

    Revision History
        08-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        14-Feb-2011 DP: Changed to use any static array (instead of only bool).
*/

function createMonitoredItems591Err012()
{
    var nodeIds = NodeIdSettings.GetScalarStaticArrayNodeIds();
    if( nodeIds.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }
    var item = MonitoredItem.fromNodeIds( [ nodeIds[0] ], 0x1234 )[0];
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created." );
    }
    else
    {
        // Create a single monitored item using an invalid subscriptionID
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;
        createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = item.NodeId;
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.IndexRange = "2147483646:2147483647";
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = item.ClientHandle;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

        addLog ( "Creating one monitored item with invalid index range of '2147483646:2147483647'" );
        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            var ExpectedServiceResultArray = new Array (1);
            ExpectedServiceResultArray[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
            ExpectedServiceResultArray[0].addExpectedResult( StatusCode.BadIndexRangeNoData );
            checkCreateMonitoredItemsError( createMonitoredItemsRequest, createMonitoredItemsResponse, ExpectedServiceResultArray );

            // update our item
            if( createMonitoredItemsResponse.Results[0].StatusCode.isGood() )
            {
                // update the item
                item.MonitoredItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;
                // delete
                var expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo ) ];
                expectedResults[0].addExpectedResult( StatusCode.Good );
                deleteMonitoredItems( item, MonitorBasicSubscription, g_session, expectedResults, true );
            }
        }
        else
        {
            addError( "createMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( createMonitoredItems591Err012 );