/* Test 5.9.2 Error Test 1, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
       Modify single monitoredItem; Specify an invalid subscriptionId.
       
       ServiceResult = Bad_SubscriptionIdInvalid
        
    Revision History
        Sep-16-2009 NP: Initial version.
        Nov-18-2009 NP: REVIEWED.
        14-Dec-2009 DP: Changed to find available NodeIds from settings.
*/

function modifyMonitoredItems592Err001()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return;
    }
    // add 3 monitored items using default parameters
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    g_session.buildRequestHeader(createMonitoredItemsRequest.RequestHeader);

    createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

    var clientHandle = 0;
    var numItemsToMonitor = 3;
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
    if ( uaStatus.isGood() )
    {
        checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );

        // Modify single monitoredItem; Specify an invalid subscriptionId
        var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
        var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
        g_session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

        modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId + 0x1234;
        modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

        modifyMonitoredItemsRequest.ItemsToModify[0].MonitoredItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;
        modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.ClientHandle = 0x1234;
        modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.DiscardOldest = true;
        modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.QueueSize = 2;
        modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.SamplingInterval = -1;

        uaStatus = g_session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            var ExpectedServiceResult = new  ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
            checkModifyMonitoredItemsFailed( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse, ExpectedServiceResult );
        }
        else
        {
            addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
    else
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
    }
    // delete the items we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s();
    for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
    {
        monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
    }        
    deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorBasicSubscription, g_session );
}

safelyInvoke( modifyMonitoredItems592Err001 );