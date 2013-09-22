/*  Test 5.9.1 Error Test 9 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies an invalid IndexRange of “2:2” (not a range) for an array item.

    Revision History
        08-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
*/

function createMonitoredItems591Err009()
{
    var nodeId = NodeIdSettings.GetArrayStaticNodeIds()[0];
    if( nodeId === null || nodeId === undefined )
    {
        addSkipped( "Arrays" );
        return;
    }

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
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = nodeId;
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.IndexRange = "2:2"; 
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0x1234;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

        addLog ( "Creating one monitored item with invalid index range of '2:2'" );
        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            var ExpectedServiceResultArray = new Array (1);
            ExpectedServiceResultArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeInvalid );
            checkCreateMonitoredItemsError( createMonitoredItemsRequest, createMonitoredItemsResponse, ExpectedServiceResultArray );
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( createMonitoredItems591Err009 );