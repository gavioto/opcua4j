/*  Test 5.9.3 Error Test # 4 prepared by Development; compliance@opcfoundation.org
    Description:
        Specify an unknown subscriptionId.

    Revision History
        01-Oct-2009 DEV: Initial version
        18-Nov-2009  NP: REVIEWED.
*/

function setMonitoringMode593Err004()
{
    // subscription is created and deleted in initialize and cleanup scripts
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }
    else
    {
        // add 3 monitored items using default parameters
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

        var clientHandle = 0;
        var numItemsToMonitor = 3;
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

        var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
        if( nodeSetting === undefined || nodeSetting === null )
        {
            addSkipped( "Static Scalar (numeric)" );
            return;
        }
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = nodeSetting.id;
        createMonitoredItemsRequest.ItemsToCreate[1].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( "uid" ).id;
        createMonitoredItemsRequest.ItemsToCreate[2].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( "diu" ).id;

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if ( uaStatus.isGood() )
        {
            checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );

            // call setMonitoringMode with invalid subscriptionId
            var setMonitoringModeRequest = new UaSetMonitoringModeRequest ();
            var setMonitoringModeResponse = new UaSetMonitoringModeResponse();
            g_session.buildRequestHeader( setMonitoringModeRequest.RequestHeader );

            setMonitoringModeRequest.MonitoringMode = MonitoringMode.Disabled;
            setMonitoringModeRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId + 0x12345;
            setMonitoringModeRequest.MonitoredItemIds[0] = createMonitoredItemsResponse.Results[0].MonitoredItemId;
            uaStatus = g_session.setMonitoringMode( setMonitoringModeRequest, setMonitoringModeResponse );
            if( uaStatus.isGood() )
            {
                var ExpectedServiceResult = new  ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
                checkSetMonitoringModeFailed( setMonitoringModeRequest, setMonitoringModeResponse, ExpectedServiceResult );
            }
            else
            {
                addError( "SetMonitoringMode() status " + uaStatus, uaStatus );
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

safelyInvoke( setMonitoringMode593Err004 );