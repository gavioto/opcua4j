/*  Test 5.9.2 Test 7 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script modifies the ClientHandle for the first item to another 
        unique number. The remaining items are modified to use a 
        queueSize of 2.

    Revision History
        07-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        10-Dec-2009 DP: Select NodeId settings more dynamically.
        09-Jun-2010 NP: Revised SamplingInterval to 0, from -1.
*/

function modifyMonitoredItems592007()
{
    if( !MonitorQueueSize2Subscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created" );
        return;
    }

    // Add 3 monitored items using default parameters
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    g_session.buildRequestHeader(createMonitoredItemsRequest.RequestHeader);

    createMonitoredItemsRequest.SubscriptionId = MonitorQueueSize2Subscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

    var clientHandle = 0;
    var numItemsToMonitor = 3;
    var i;
    addLog ( "Creating " + numItemsToMonitor + " monitored items." );
    for( i = 0; i< numItemsToMonitor; i++ )
    {
        createMonitoredItemsRequest.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
        addLog ( "ClientHandle of item #" + i + ": " + clientHandle );
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.SamplingInterval = 0;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
    }

    var nodeIds = NodeIdSettings.GetScalarStaticNodeIds();

    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = nodeIds[0];
    createMonitoredItemsRequest.ItemsToCreate[1].ItemToMonitor.NodeId = nodeIds[1 % nodeIds.length];
    createMonitoredItemsRequest.ItemsToCreate[2].ItemToMonitor.NodeId = nodeIds[2 % nodeIds.length];

    var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
    if ( !uaStatus.isGood() )
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        return;
    }

    checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );
    addLog ( "Successfully created the " + numItemsToMonitor + " monitored items." );

    addLog ( "Modifying the " + numItemsToMonitor + " monitored items. Setting the ClientHandle of the first item to another unique number(" + clientHandle + ")." );
    // Modify the three monitoredItems; Specify a new unique clienthandle for the first item
    var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
    var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
    g_session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

    modifyMonitoredItemsRequest.SubscriptionId = MonitorQueueSize2Subscription.SubscriptionId;
    modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

    modifyMonitoredItemsRequest.ItemsToModify[0].MonitoredItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.ClientHandle = clientHandle;

    modifyMonitoredItemsRequest.ItemsToModify[1].MonitoredItemId = createMonitoredItemsResponse.Results[1].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[1].RequestedParameters.QueueSize = 2;

    modifyMonitoredItemsRequest.ItemsToModify[2].MonitoredItemId = createMonitoredItemsResponse.Results[2].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[2].RequestedParameters.QueueSize = 2;

    uaStatus = g_session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );        
    if( !uaStatus.isGood() )
    {
        addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
    }
    else
    {
        addLog ( "Modified the items. The results are:" );
        // Check the results of the modification.
        if( checkModifyMonitoredItemsValidParameter( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse ) )
        {
            addLog( "Results[0].RevisedQueueSize = " + modifyMonitoredItemsResponse.Results[0].RevisedQueueSize );
            addLog( "Results[1].RevisedQueueSize = " + modifyMonitoredItemsResponse.Results[1].RevisedQueueSize );
            addLog( "Results[2].RevisedQueueSize = " + modifyMonitoredItemsResponse.Results[2].RevisedQueueSize );
        }
    }

    // Cleanup
    // Delete the items we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s();
    for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
    {
        monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
    }        
    deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorQueueSize2Subscription, g_session );
}

safelyInvoke( modifyMonitoredItems592007 );