/*  Test 5.9.2 Test 12 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script modifies the queueSize of the first item to max UInt32.
        We expect that no server will accept a queue of this size, so we are checking 
        to make usre the size != max UInt32.

    Revision History
        08-Oct-2009 AT: Initial Version.
        18-Nov-2009 NP: REVIEWED.
        14-Dec-2009 DP: Changed to find available NodeIds from settings.
*/

function modifyMonitoredItems592012()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created" );
        return;
    }

    // Add 3 monitored items using default parameters
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    g_session.buildRequestHeader(createMonitoredItemsRequest.RequestHeader);

    createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

    var clientHandle = 0;
    var numItemsToMonitor = 3;
    print( "Creating " + numItemsToMonitor + " monitored items." );
    for( var i = 0; i< numItemsToMonitor; i++ )
    {
        createMonitoredItemsRequest.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
    }

    var setting1 = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Boolean, "i", "u", "d" ] );
    if( setting1 === undefined || setting1 === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = setting1.id;
    createMonitoredItemsRequest.ItemsToCreate[1].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Byte, BuiltInType.SByte, "u", "i", "d" ] ).id;
    createMonitoredItemsRequest.ItemsToCreate[2].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( "diu" ).id;

    var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
    if ( !uaStatus.isGood() )
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        return;
    }

    checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );
    print( "Successfully created the " + numItemsToMonitor + " monitored items." );
    print( "Modifying the " + numItemsToMonitor + " monitored items. Setting the 'QueueSize' of the first item to max unsigned int value('" + Constants.UInt32_Max + "')." );
    // Modify the three monitoredItems; Specify MAX UINT32 for the QueueSize of the first item
    var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
    var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
    g_session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

    modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

    modifyMonitoredItemsRequest.ItemsToModify[0].MonitoredItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.QueueSize = Constants.UInt32_Max;
    modifyMonitoredItemsRequest.ItemsToModify[1].MonitoredItemId = createMonitoredItemsResponse.Results[1].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[1].RequestedParameters.DiscardOldest = false;
    modifyMonitoredItemsRequest.ItemsToModify[2].MonitoredItemId = createMonitoredItemsResponse.Results[2].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[2].RequestedParameters.DiscardOldest = false;

    uaStatus = g_session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );        
    if( !uaStatus.isGood() )
    {
        addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
        return;
    }
   
    print( "Modified the items. The results are:" );
    // Check the results of the modification.
    checkModifyMonitoredItemsValidParameter( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );

    // make sure the revisedQueueSize != maxInt32
    AssertNotEqual( Constants.UInt32_Max, modifyMonitoredItemsResponse.Results[0].RevisedQueueSize, "Server did not revise the maxInt value of the queueSize. Servers must put a cap on the max size of queue they support to avoid consuming too many resources." );

    // Cleanup
    // Delete the items we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s();
    for( i=0; i<createMonitoredItemsResponse.Results.length; i++ )
    {
        monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
    }
    deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorBasicSubscription, g_session );
}

safelyInvoke( modifyMonitoredItems592012 );