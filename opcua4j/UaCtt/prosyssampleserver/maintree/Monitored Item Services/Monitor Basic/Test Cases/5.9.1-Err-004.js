/*  Test 5.9.1 Error Test 4, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Creates a single monitoredItem with invalid NodeId.
        Expected result = Bad_NodeIdInvalid or Bad_NodeIdUnknown.

        subscription is created and deleted in initialize and cleanup scripts

    Revision History
        Sep-16-2009 Dev: Initial version.
        Oct-08-2009 AT: Corrected script to create a single monitored item instead of multiple.
*/

function createMonitoredItems591Err004()
{
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

        createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/InvalidNodeId1" ).toString() );
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0;;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = 1000;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

        addLog( "Calling CreateMonitoredItems with '" + createMonitoredItemsRequest.ItemsToCreate.length + "' items being requested." );

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            // for the item, we'll be happy to receive one of these error codes:
            //  a) bad_nodeIdUnknown
            //  b) bad_nodeIdInvalid
            var expectedServiceResult = new Array(1);
            expectedServiceResult[0] = new ExpectedAndAcceptedResults();
            expectedServiceResult[0].addExpectedResult( StatusCode.BadNodeIdUnknown );
            expectedServiceResult[0].addExpectedResult( StatusCode.BadNodeIdInvalid );

            // check the results and look for the above errors.
            checkCreateMonitoredItemsError( createMonitoredItemsRequest, createMonitoredItemsResponse, expectedServiceResult );
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( createMonitoredItems591Err004 );