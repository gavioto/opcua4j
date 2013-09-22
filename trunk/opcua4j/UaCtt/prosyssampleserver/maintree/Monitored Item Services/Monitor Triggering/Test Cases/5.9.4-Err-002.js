/*    Test 5.9.4 Error Test 2 prepared by Anand Taparia; ataparia@kepware.com
      Description:
        Script specifies an invalid triggeringItemId.

      Revision History:
        Sep-26-2009 AT: Initial version.
        Nov-25-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support Triggering!
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
*/

function setTriggering594Err002()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
    if( items == null || items.length < 2 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    if( !MonitorTriggeringSubscription.SubscriptionCreated )
    {
        addError( "Subscription for conformance unit Monitor Triggering was not created." );
    }
    else
    {
        // add 2 monitored items using default parameters
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

        createMonitoredItemsRequest.SubscriptionId = MonitorTriggeringSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

        var clientHandle = 0;
        var numItemsToMonitor = 2;
        for( var i = 0; i< numItemsToMonitor; i++ )
        {
            createMonitoredItemsRequest.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
            createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.SamplingInterval = SAMPLING_RATE_FASTEST;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;

            switch(i)
            {
                // triggering items
                case 0:
                    createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.NodeId = items[0].NodeId;
                    createMonitoredItemsRequest.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
                    break;
                // item to link
                case 1:
                    createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.NodeId = items[1].NodeId;
                    createMonitoredItemsRequest.ItemsToCreate[i].MonitoringMode = MonitoringMode.Sampling;
                    break;
                default:
                    break;
            }
        }

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if ( uaStatus.isGood() )
        {
            checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );

            // set triggering with an invalid subscriptionId
            var setTriggeringRequest = new UaSetTriggeringRequest();
            var setTriggeringResponse = new UaSetTriggeringResponse();
            g_session.buildRequestHeader( setTriggeringRequest.RequestHeader );

            setTriggeringRequest.TriggeringItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId + 0x1234;
            setTriggeringRequest.SubscriptionId = MonitorTriggeringSubscription.SubscriptionId;

            setTriggeringRequest.LinksToAdd[0] = createMonitoredItemsResponse.Results[1].MonitoredItemId;

            uaStatus = g_session.setTriggering( setTriggeringRequest, setTriggeringResponse );

            if( uaStatus.isGood() )
            {
                var ExpectedServiceResult = new  ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );   
                checkSetTriggeringFailed( setTriggeringRequest, setTriggeringResponse, ExpectedServiceResult );
            }
            else
            {
                addError( "SetTriggering() status " + uaStatus, uaStatus );
            }

            // delete the items we added in this test
            var monitoredItemsIdsToDelete = new UaUInt32s();
            for( var i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
            {
                monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
            }        
            deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorTriggeringSubscription, g_session );
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( setTriggering594Err002 );