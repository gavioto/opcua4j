/*  Test 5.9.2 Error Test 6 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies some valid and some invalid monitoredItemIds.

        Revision History
            07-Oct-2009 AT: Initial Version.
            18-Nov-2009 NP: REVIEWED.
            14-Dec-2009 DP: Changed to find available NodeIds from settings.
*/

function modifyMonitoredItems592Err006()
{
    var i;
    
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created" );
        return;
    }

    // Add 6 monitored items using default parameters
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

    createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

    var numItemsToMonitor = 6;
    print( "Creating " + numItemsToMonitor + " monitored items." );
    for( i=0; i<numItemsToMonitor; i++ )
    {
        createMonitoredItemsRequest.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle = i;
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
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Boolean, "i", "u", "d" ] ).id;
    createMonitoredItemsRequest.ItemsToCreate[1].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Byte, BuiltInType.SByte, "u", "i", "d" ] ).id;
    createMonitoredItemsRequest.ItemsToCreate[2].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Double, "d", "i", "u" ] ).id;
    createMonitoredItemsRequest.ItemsToCreate[3].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Float, "d", "i", "u" ] ).id;
    createMonitoredItemsRequest.ItemsToCreate[4].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.String, "u", "i", "d" ] ).id;
    createMonitoredItemsRequest.ItemsToCreate[5].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Int16, "i", "u", "d" ] ).id;

    var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
    if ( !uaStatus.isGood() )
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
    }

    if( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse ) )
    {
        print( "Successfully created the " + numItemsToMonitor + " monitored items." );
        print( "Modifying monitored items. Specifying some valid and some invalid monitoredItemIds." );
        var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
        var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
        g_session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

        modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;        
        modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

        for( i = 0; i < numItemsToMonitor; i++ )
        {
            // Only parameter being modified
            modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.QueueSize = 2;
        }

        // Let's specify indices 1,3,5 as invalid MonitoredItemIds
        modifyMonitoredItemsRequest.ItemsToModify[0].MonitoredItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;
        modifyMonitoredItemsRequest.ItemsToModify[1].MonitoredItemId = 0x1234;
        modifyMonitoredItemsRequest.ItemsToModify[2].MonitoredItemId = createMonitoredItemsResponse.Results[2].MonitoredItemId;
        modifyMonitoredItemsRequest.ItemsToModify[3].MonitoredItemId = 0x1235;
        modifyMonitoredItemsRequest.ItemsToModify[4].MonitoredItemId = createMonitoredItemsResponse.Results[4].MonitoredItemId;
        modifyMonitoredItemsRequest.ItemsToModify[5].MonitoredItemId = 0x1236;

        uaStatus = g_session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );
        if( !uaStatus.isGood() )
        {
            addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
        }

        print( "Modified the items. The results are:" );
        // Check results
        // Indices 1,3,5 should return 'BadMonitoredItemIdInvalid' rest all 'Good'
        var ExpectedOperationResultsArray = [];
        ExpectedOperationResultsArray [0] = new ExpectedAndAcceptedResults( StatusCode.Good );
        ExpectedOperationResultsArray [1] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
        ExpectedOperationResultsArray [2] = new ExpectedAndAcceptedResults( StatusCode.Good );
        ExpectedOperationResultsArray [3] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
        ExpectedOperationResultsArray [4] = new ExpectedAndAcceptedResults( StatusCode.Good );
        ExpectedOperationResultsArray [5] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
        checkModifyMonitoredItemsError( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse, ExpectedOperationResultsArray );
    }//if checkCreateMonitoredItemsValidParameter

    // Cleanup
    // Delete the items we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s();
    for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
    {
        monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
    }        
    deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorBasicSubscription, g_session );
}

safelyInvoke( modifyMonitoredItems592Err006 );