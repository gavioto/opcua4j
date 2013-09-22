/*  Test 5.9.1 Error Test 8 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies an invalid IndexRange of “2-4” (hyphen is an incorrect character) 
        for an array item.

    Revision History
        08-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        09-Dec-2009 DP: Give a warning if no static arrays are in settings.
        10-Feb-2010 DP: Delete the monitored item if the creation attempt succeeded.
*/

function createMonitoredItems591Err008()
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
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.IndexRange = "2-4"; 
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0x1234;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

        addLog ( "Creating one monitored item with invalid index range of '2-4'" );
        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            var ExpectedServiceResultArray = new Array (1);
            ExpectedServiceResultArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeInvalid );
            checkCreateMonitoredItemsError( createMonitoredItemsRequest, createMonitoredItemsResponse, ExpectedServiceResultArray );
            
            if( createMonitoredItemsResponse.Results[0].StatusCode.isGood() )
            {
                deleteMonitoredItems( [ createMonitoredItemsResponse.Results[0].MonitoredItemId ], MonitorBasicSubscription, g_session );
            }
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( createMonitoredItems591Err008 );