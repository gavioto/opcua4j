/*  Test 5.9.1 Error Test 22 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies an invalid samplingInterval of -10 ms.
        Expected result: ServiceResult/OperationResult: Good
                         The UA server should revise the SamplingInterval to > 0.

    Revision History
        09-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        09-Jun-2010 NP: Revised assertion of samplingInterval to be >0 instead of = revisedPublishingInterval.
*/

function createMonitoredItems591Err022()
{

    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
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
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0x1234;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -10;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );

            // Check the SamplingInterval was revised to a positive no.
            print( "RevisedSamplingInterval is: " + createMonitoredItemsResponse.Results[0].RevisedSamplingInterval );
            if( AssertNotEqual( -10, createMonitoredItemsResponse.Results[0].RevisedSamplingInterval, "Expected the Server to revise the sampling interval." ) )
            {
                // now make sure the revised sampling interval matches the revisedPublishingInterval
                AssertGreaterThan( 0, createMonitoredItemsResponse.Results[0].RevisedSamplingInterval, "Sampling interval expected to be revised to a value greater than 0." );
            }

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

safelyInvoke( createMonitoredItems591Err022 );