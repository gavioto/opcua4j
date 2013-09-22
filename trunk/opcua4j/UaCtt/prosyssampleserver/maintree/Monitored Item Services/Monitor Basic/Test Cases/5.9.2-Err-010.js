/*  Test 5.9.2 Error Test 10 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies a value for 'TimestampsToReturn' that is not in the enum.

    Revision History
        07-Oct-2009 AT: Initial Version.
        18-Nov-2009 NP: REVIEWED.
        14-Dec-2009 DP: Changed to find available NodeIds from settings.
*/

function modifyMonitoredItems592Err010()
{
    const INVALIDTIMESTAMPENUMVALUE = 0x999;

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created" );
        return;
    }

    // Add 1 monitored items using default parameters
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

    createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

    print( "Creating 1 monitored item." );
    createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
    createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

    var setting1 = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Boolean, "i", "u", "d" ] );
    if( setting1 === undefined || setting1 === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = setting1.id;

    var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
    if ( !uaStatus.isGood() )
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        return;
    }

    checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );
    print( "Successfully created the monitored item." );
    print( "Modifying the monitored item. Setting the 'TimestampsToReturn' to an invalid value." );
    // Modify the monitoredItem; Specify an invalid value for 'TimestampsToReturn'
    var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
    var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
    g_session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

    modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    modifyMonitoredItemsRequest.TimestampsToReturn = INVALIDTIMESTAMPENUMVALUE;

    modifyMonitoredItemsRequest.ItemsToModify[0].MonitoredItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;

    uaStatus = g_session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );        
    if( !uaStatus.isGood() )
    {
        addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
    }
    print( "Modified the item. The result is:" );
    // Check the results of the modification.
    var ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadTimestampsToReturnInvalid );
    checkModifyMonitoredItemsFailed( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse, ExpectedServiceResult );

    // Cleanup
    // Delete the items we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s();
    for( var i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
    {
        monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
    }
    deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorBasicSubscription, g_session );
}

safelyInvoke( modifyMonitoredItems592Err010 );