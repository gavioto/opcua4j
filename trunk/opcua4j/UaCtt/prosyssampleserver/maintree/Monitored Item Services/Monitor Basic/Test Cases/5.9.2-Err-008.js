/*  Test 5.9.2 Error Test 8 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script modifies the items in one subscription but specifies the 
        monitoredItemId of an item from another subscription.
        
        This test will accept a "Bad_MonitoredItemIdInvalid" or "Good" as the 
        operation level result, because: 
         1) if the server generates unique Ids per subscrition, then the item 
            being modified in the "other" subscription may actually exist in the 
            original subscription. Therefore a "Good" would be received.
         2) if the server generates unique Ids for ALL monitoredItems, then each 
            item will have a different Id and therefore we could expect that 
            the server returns Bad_InvalidMonitoredItemId.

    Revision History
        07-Oct-2009 AT: Initial Version.
        18-Nov-2009 NP: REVIEWED/INCONCLUSIVE. UA Server is returning Bad_UnexpectedError.
        14-Dec-2009 DP: Changed to find available NodeIds from settings.
*/

function modifyMonitoredItems592Err008()
{

    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    var i;
    
    // We already have one subscription created in the initialize routine. Lets's
    // create the second one here
    SecondSubscription = new Subscription();
    createSubscription( SecondSubscription, g_session );

    // Just for clarity
    var FirstSubscription = MonitorBasicSubscription;
    if( !FirstSubscription.SubscriptionCreated || !SecondSubscription.SubscriptionCreated )
    {
        addError( "One or both subscriptions for conformance unit Monitor Basic was not created." );
        return;
    }

    // Add 3 items to the first subscription
    var createMonitoredItemsRequestFirstSub = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponseFirstSub = new UaCreateMonitoredItemsResponse();
    g_session.buildRequestHeader( createMonitoredItemsRequestFirstSub.RequestHeader );

    createMonitoredItemsRequestFirstSub.SubscriptionId = FirstSubscription.SubscriptionId;
    createMonitoredItemsRequestFirstSub.TimestampsToReturn = TimestampsToReturn.Both;

    var clientHandle = 0;
    var numItemsToMonitorFirstSub = 3;
    print( "Creating " + numItemsToMonitorFirstSub + " monitored items in the first subscription." );
    for( i = 0; i < numItemsToMonitorFirstSub; i++ )
    {
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
    }

    var setting1 = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Boolean, "i", "u", "d" ] );
    if( setting1 === undefined || setting1 === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    createMonitoredItemsRequestFirstSub.ItemsToCreate[0].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Boolean, "i", "u", "d" ] ).id;
    createMonitoredItemsRequestFirstSub.ItemsToCreate[1].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Byte, BuiltInType.SByte, "u", "i", "d" ] ).id;
    createMonitoredItemsRequestFirstSub.ItemsToCreate[2].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( "diu" ).id;

    var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequestFirstSub, createMonitoredItemsResponseFirstSub );
    if ( !uaStatus.isGood() )
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        return;
    }

    if ( !checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequestFirstSub, createMonitoredItemsResponseFirstSub ) )
    {
        addError( "Unable to validate parameters when creating monitoring items for the first subscription. Stopping test." );
        return;
    }
    print( "Successfully created the " + numItemsToMonitorFirstSub + " monitored items in the first subscription." );        

    // Now add 3 items to the second subscription
    var createMonitoredItemsRequestSecondSub = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponseSecondSub = new UaCreateMonitoredItemsResponse();
    g_session.buildRequestHeader( createMonitoredItemsRequestSecondSub.RequestHeader );

    createMonitoredItemsRequestSecondSub.SubscriptionId = SecondSubscription.SubscriptionId;
    createMonitoredItemsResponseSecondSub.TimestampsToReturn = TimestampsToReturn.Both;

    clientHandle = 0;
    var numItemsToMonitorSecondSub = 3;
    addLog ( "Creating " + numItemsToMonitorFirstSub + " monitored items in the second subscription." );
    for( i = 0; i < numItemsToMonitorSecondSub; i++ )
    {
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
    }

    createMonitoredItemsRequestSecondSub.ItemsToCreate[0].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Float, "d", "u", "i" ] ).id;
    createMonitoredItemsRequestSecondSub.ItemsToCreate[1].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.String, "u", "i", "d" ] ).id;
    createMonitoredItemsRequestSecondSub.ItemsToCreate[2].ItemToMonitor.NodeId = items[0].NodeId;

    uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequestSecondSub, createMonitoredItemsResponseSecondSub );
    if ( !uaStatus.isGood() )
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        return;
    }
    if ( !checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequestSecondSub, createMonitoredItemsResponseSecondSub ) )
    {
        addError( "Unable to validate parameters when creating monitoring items for the second subscription. Stopping test." );
        return;
    }

    print( "Successfully created the " + numItemsToMonitorFirstSub + " monitored items in the second subscription." );        
    print( "Modifying all the items in the first subscription and 1 item from the second subscription while specifying the subscripionID of the first subscription." );
    var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
    var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
    g_session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

    modifyMonitoredItemsRequest.SubscriptionId = FirstSubscription.SubscriptionId;
    modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

    for( i = 0; i < (numItemsToMonitorFirstSub + 1); i++ )
    {
        // Only parameter being modified
        modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.QueueSize = 2;
    }

    // Let's specify monitored item in index 1 from the second subscription
    modifyMonitoredItemsRequest.ItemsToModify[0].MonitoredItemId = createMonitoredItemsResponseFirstSub.Results[0].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[1].MonitoredItemId = createMonitoredItemsResponseSecondSub.Results[0].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[2].MonitoredItemId = createMonitoredItemsResponseFirstSub.Results[1].MonitoredItemId;
    modifyMonitoredItemsRequest.ItemsToModify[3].MonitoredItemId = createMonitoredItemsResponseFirstSub.Results[2].MonitoredItemId;

    uaStatus = g_session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );
    if( !uaStatus.isGood() )
    {
        addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
    }
    else
    {
        print( "Modified the items. The results are:" );
        // Check results
        // Index 1 should return 'BadMonitoredItemIdInvalid' rest all 'Good'
        var ExpectedOperationResultsArray = [];
        ExpectedOperationResultsArray [0] = new ExpectedAndAcceptedResults( StatusCode.Good );
        ExpectedOperationResultsArray [1] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
        ExpectedOperationResultsArray [1].addExpectedResult( StatusCode.Good );
        ExpectedOperationResultsArray [2] = new ExpectedAndAcceptedResults( StatusCode.Good );
        ExpectedOperationResultsArray [3] = new ExpectedAndAcceptedResults( StatusCode.Good );
        checkModifyMonitoredItemsError( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse, ExpectedOperationResultsArray );
    }

    // Cleanup
    // Delete the item we added to the first subscription
    var monitoredItemsIdsToDeleteFirstSub = new UaUInt32s();
    for( i = 0; i< createMonitoredItemsResponseFirstSub.Results.length; i++ )
    {
        monitoredItemsIdsToDeleteFirstSub[i] = createMonitoredItemsResponseFirstSub.Results[i].MonitoredItemId;
    }
    deleteMonitoredItems( monitoredItemsIdsToDeleteFirstSub, FirstSubscription, g_session );

    // Delete the item we added to the second subscription
    var monitoredItemsIdsToDeleteSecondSub = new UaUInt32s();
    for( i = 0; i< createMonitoredItemsResponseSecondSub.Results.length; i++ )
    {
        monitoredItemsIdsToDeleteSecondSub[i] = createMonitoredItemsResponseSecondSub.Results[i].MonitoredItemId;
    }        
    deleteMonitoredItems( monitoredItemsIdsToDeleteSecondSub, SecondSubscription, g_session );

    // Delete the second subscription (first subscription will be deleted in the common cleanup code)
    deleteSubscription( SecondSubscription, g_session );        
}

safelyInvoke( modifyMonitoredItems592Err008 );