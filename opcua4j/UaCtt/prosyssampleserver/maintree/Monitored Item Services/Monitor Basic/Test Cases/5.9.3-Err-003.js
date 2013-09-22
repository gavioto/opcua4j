/*    Test 5.9.3 Error Test 3 prepared by Anand Taparia; ataparia@kepware.com
      Description:
          Script specifies some valid and some invalid monitorIds.

      Revision History
        Sep-26-2009 AT: Initial version.
        Nov-16-2009 NP: REVIEWED/INCONCLUSIVE. Server returns Bad_UnexpectedError.
        Dec-18-2009 DP: Finds a configured NodeId in settings (instead of using settings that may not be set).
*/

function setMonitoringMode593Err003()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }
    else
    {
        // Add monitored items using default parameters
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

        var clientHandle = 0;
        var numItemsToMonitor = 6;
        var i;
        for( i = 0; i< numItemsToMonitor; i++ )
        {
            createMonitoredItemsRequest.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
            createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
            createMonitoredItemsRequest.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.SamplingInterval = -1;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
        }

        var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting();
        if( nodeSetting === undefined || nodeSetting === null )
        {
            addSkipped( "Static Scalar" );
            return;
        }
        var nodeId = nodeSetting.id;
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = nodeId;
        createMonitoredItemsRequest.ItemsToCreate[1].ItemToMonitor.NodeId = nodeId;
        createMonitoredItemsRequest.ItemsToCreate[2].ItemToMonitor.NodeId = nodeId;
        createMonitoredItemsRequest.ItemsToCreate[3].ItemToMonitor.NodeId = nodeId;
        createMonitoredItemsRequest.ItemsToCreate[4].ItemToMonitor.NodeId = nodeId;
        createMonitoredItemsRequest.ItemsToCreate[5].ItemToMonitor.NodeId = nodeId;

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if ( uaStatus.isGood() )
        {
            checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );

            // Set the monitoringmode
            var setMonitoringModeRequest = new UaSetMonitoringModeRequest();
            var setMonitoringModeResponse = new UaSetMonitoringModeResponse();
            g_session.buildRequestHeader( setMonitoringModeRequest.RequestHeader );

            setMonitoringModeRequest.MonitoringMode = MonitoringMode.Disabled;
            setMonitoringModeRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;

            //  Lets set indices 1,3,5 invalid
            setMonitoringModeRequest.MonitoredItemIds[0] = createMonitoredItemsResponse.Results[0].MonitoredItemId;
            setMonitoringModeRequest.MonitoredItemIds[1] = createMonitoredItemsResponse.Results[1].MonitoredItemId + 0x1234;
            setMonitoringModeRequest.MonitoredItemIds[2] = createMonitoredItemsResponse.Results[2].MonitoredItemId;
            setMonitoringModeRequest.MonitoredItemIds[3] = createMonitoredItemsResponse.Results[3].MonitoredItemId + 0x1234;
            setMonitoringModeRequest.MonitoredItemIds[4] = createMonitoredItemsResponse.Results[4].MonitoredItemId;
            setMonitoringModeRequest.MonitoredItemIds[5] = createMonitoredItemsResponse.Results[5].MonitoredItemId + 0x1234;

            uaStatus = g_session.setMonitoringMode( setMonitoringModeRequest, setMonitoringModeResponse );

            if( uaStatus.isGood() )
            {
                // this is an array of ExpectedAndAcceptedResult. 
                var ExpectedOperationResultsArray = [];
                ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
                ExpectedOperationResultsArray[1] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
                ExpectedOperationResultsArray[2] = new ExpectedAndAcceptedResults( StatusCode.Good );
                ExpectedOperationResultsArray[3] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
                ExpectedOperationResultsArray[4] = new ExpectedAndAcceptedResults( StatusCode.Good );
                ExpectedOperationResultsArray[5] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
                checkSetMonitoringModeError( setMonitoringModeRequest, setMonitoringModeResponse, ExpectedOperationResultsArray );
            }
            else
            {
                addError("SetMonitoringMode() status " + uaStatus, uaStatus);
            }

            // delete the items we added in this test
            var monitoredItemsIdsToDelete = new UaUInt32s();
            for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
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

safelyInvoke( setMonitoringMode593Err003 );