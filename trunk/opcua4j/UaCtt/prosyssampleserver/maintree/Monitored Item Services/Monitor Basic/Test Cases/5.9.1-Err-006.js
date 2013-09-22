/*  Test 5.9.1 Error Test 6, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Creates a single monitoredItem while specifying an invalid attribute Id.
        Expected result = Bad_AttributeIdInvalid.

        subscription is created and deleted in initialize and cleanup scripts

    Revision History:
        Sep-16-2009 NP: Initial version.
        Nov-24-2009 NP: REVIEWED.
*/

function createMonitoredItems591Err006()
{
    const INVALIDATTRIBUTEID = 0x1234;

    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
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
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = items[0].NodeId;
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = INVALIDATTRIBUTEID;
        createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = 1000;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            var expectedServiceResult = Array(1);
            expectedServiceResult[0] = new ExpectedAndAcceptedResults( StatusCode.BadAttributeIdInvalid );
            checkCreateMonitoredItemsError( createMonitoredItemsRequest, createMonitoredItemsResponse, expectedServiceResult );
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( createMonitoredItems591Err006 );