/*  Test 5.9.5 Error case #2 prepared by Development; compliance@opcfoundation.org
    Description:
        Specify a valid subscriptionId and an invalid monitoredItemId.

    Revision History
        01-Oct-2009 DEV: Initial version.
        18-Nov-2009  NP: REVIEWED.
        13-Jul-2010 DP: Use additional scalar node settings.
*/

function deleteMonitoredItems595Err002()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStaticAll(), 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, -1, TimestampsToReturn.Both, true );
    if( items == null || items.length < 2 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    // subscription is created and deleted in initialize and cleanup scripts
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }
    else
    {    
        // add one monitored item using default parameters
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
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if ( uaStatus.isGood() )
        {
            checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );

            // delete monitored item
            var deleteMonitoredItemsRequest = new UaDeleteMonitoredItemsRequest();
            var deleteMonitoredItemsResponse = new UaDeleteMonitoredItemsResponse();
            g_session.buildRequestHeader( deleteMonitoredItemsRequest.RequestHeader );

            deleteMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
            deleteMonitoredItemsRequest.MonitoredItemIds[0] = createMonitoredItemsResponse.Results[0].MonitoredItemId + 5;

            uaStatus = g_session.deleteMonitoredItems( deleteMonitoredItemsRequest, deleteMonitoredItemsResponse );
            if( uaStatus.isGood() )
            {
                // this is an array of ExpectedAndAcceptedResult. Size of the array = number of items to delete
                var ExpectedOperationResultsArray = new Array(1);
                ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
                checkDeleteMonitoredItemsError( deleteMonitoredItemsRequest, deleteMonitoredItemsResponse, ExpectedOperationResultsArray );
            }
            else
            {
                addError( "DeleteMonitoredItems() status " + uaStatus, uaStatus );
            }

            // delete the items we added in this test
            var monitoredItemsIdsToDelete = new UaUInt32s();
            for( var i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
            {
                monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
            }
            deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorBasicSubscription, g_session );
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( deleteMonitoredItems595Err002 );