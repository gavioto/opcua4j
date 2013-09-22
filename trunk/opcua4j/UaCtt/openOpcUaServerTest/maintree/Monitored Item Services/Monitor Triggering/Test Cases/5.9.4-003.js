/*    Test 5.9.4 Test 3 prepared by Anand Taparia; ataparia@kepware.com
      Description:
          Script adds single item as LinksToRemove, where the item was 
          previously added in linksToAdd.

      Revision History
        Sep-24-2009 Anand Taparia: Initial version
        Nov-18-2009 NP: REVIEWED/INCONCLUSIVE. OPCF UA Sample Server does not implement SetTriggering.
        Jan-12-2010 DP: Changed NodeId settings to be from Scalar Set 1.
        Mar-26-2010 DP: Changed NodeId settings to be from any static scalar.
*/

/*globals addError, addLog, Attribute, checkCreateMonitoredItemsValidParameter,
  checkSetTriggeringValidParameter, deleteMonitoredItems, g_session, MonitoredItem,
  MonitoringMode, MonitorTriggeringSubscription, NodeIdSettings, print, safelyInvoke,
  TimestampsToReturn, UaCreateMonitoredItemsRequest, UaCreateMonitoredItemsResponse, 
  UaMonitoredItemCreateRequest, UaSetTriggeringRequest, UaSetTriggeringResponse, UaUInt32s
*/

function setTriggering594003()
{
    var items = MonitoredItem.createMinimumMonitoredItemsFromSettings( NodeIdSettings.ScalarStaticAll(), 2 );
    if( items === null )
    {
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
        var i;
        for( i = 0; i< numItemsToMonitor; i++ )
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

        print( "CreateMonitoredItems()" );
        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if ( uaStatus.isGood() )
        {
            if( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse ) )
            {
                // set triggering for one valid trigger and one valid link
                var setTriggeringRequest = new UaSetTriggeringRequest();
                var setTriggeringResponse = new UaSetTriggeringResponse();
                g_session.buildRequestHeader( setTriggeringRequest.RequestHeader );

                setTriggeringRequest.TriggeringItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;
                setTriggeringRequest.SubscriptionId = MonitorTriggeringSubscription.SubscriptionId;
                setTriggeringRequest.LinksToAdd[0] = createMonitoredItemsResponse.Results[1].MonitoredItemId;

                addLog( "SetTriggering() (to Add the item)" );
                uaStatus = g_session.setTriggering( setTriggeringRequest, setTriggeringResponse );
                if( uaStatus.isGood() )
                {
                    if( checkSetTriggeringValidParameter( setTriggeringRequest, setTriggeringResponse ) )
                    {
                        // Now remove the link we just added
                        var setTriggeringRequestToRemove = new UaSetTriggeringRequest();
                        var setTriggeringResponseToRemove = new UaSetTriggeringResponse();
                        g_session.buildRequestHeader( setTriggeringRequestToRemove.RequestHeader );

                        setTriggeringRequestToRemove.TriggeringItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;
                        setTriggeringRequestToRemove.SubscriptionId = MonitorTriggeringSubscription.SubscriptionId;
                        setTriggeringRequestToRemove.LinksToRemove [0] = createMonitoredItemsResponse.Results[1].MonitoredItemId;

                        addLog( "SetTriggering() (to remove the item)" );
                        uaStatus = g_session.setTriggering( setTriggeringRequestToRemove, setTriggeringResponseToRemove);
                        if( uaStatus.isGood() )
                        {
                            checkSetTriggeringValidParameter( setTriggeringRequestToRemove, setTriggeringResponseToRemove );
                        }
                        else
                        {
                            addError( "SetTriggering() status " + uaStatus, uaStatus );
                        }
                    }
                }
                else
                {
                    addError( "SetTriggering() status " + uaStatus, uaStatus );
                }
            }
            // delete the items we added in this test
            var monitoredItemsIdsToDelete = new UaUInt32s();
            for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
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

safelyInvoke( setTriggering594003 );