/*  Test 5.9.1 Error Test 25 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies an invalid IndexRange of “-4:-2” (negative) for an array item.

    Revision History
        09-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        13-Dec-2009 DP: Exit with a warning (rather than an error) if no array settings are set.
*/

function createMonitoredItems591Err025()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0 );
    if( items === null || items.length === 0 )
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
        // Create a single monitored item
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;
        createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = items[0].NodeId;
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.IndexRange = "-4:-2"; 
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0x1234;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

        print( "Creating one monitored item with invalid index range of '-4:-2'" );
        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            var ExpectedServiceResultArray = new Array (1);
            ExpectedServiceResultArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeInvalid );
            checkCreateMonitoredItemsError( createMonitoredItemsRequest, createMonitoredItemsResponse, ExpectedServiceResultArray );

            // clean up (if required)
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

safelyInvoke( createMonitoredItems591Err025 );