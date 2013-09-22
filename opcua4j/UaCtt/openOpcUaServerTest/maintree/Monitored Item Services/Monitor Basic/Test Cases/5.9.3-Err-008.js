/*  Test 5.9.3 Error Test 8 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script sets monitoring mode of at least one monitoreditemId belonging 
        to a different subscription.

        Revision History
            05-Oct-2009 AT: Initial version.
            18-Nov-2009 NP: REVIEWED/INCONCLUSIVE. OPCF UA Server is returning Bad_UnexpectedError.
            18-Dec-2009 DP: Finds configured NodeIds (instead of using NodeIds that may not be configured in settings).
                            Allow for servers that use the same MonitoredItemIds in different subscriptions.
*/

function setMonitoringMode593Err008()
{
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

    // Add monitored items using default parameters to the first subscription
    var createMonitoredItemsRequestFirstSub = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponseFirstSub = new UaCreateMonitoredItemsResponse();
    var createMonitoredItemsRequestSecondSub;
    var createMonitoredItemsResponseSecondSub;
    
    g_session.buildRequestHeader( createMonitoredItemsRequestFirstSub.RequestHeader );

    createMonitoredItemsRequestFirstSub.SubscriptionId = FirstSubscription.SubscriptionId;
    createMonitoredItemsRequestFirstSub.TimestampsToReturn = TimestampsToReturn.Both;

    var clientHandle = 0;
    var numItemsToMonitorFirstSub = 2;
    addLog ( "\nSTEP 1: Adding " + numItemsToMonitorFirstSub + " monitored items to the first subscription." );
    for( var i = 0; i < numItemsToMonitorFirstSub; i++ )
    {
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequestFirstSub.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
    }

    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( nodeSetting === undefined || nodeSetting === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    createMonitoredItemsRequestFirstSub.ItemsToCreate[0].ItemToMonitor.NodeId = nodeSetting.id;
    createMonitoredItemsRequestFirstSub.ItemsToCreate[1].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( "uid" ).id;

    var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequestFirstSub, createMonitoredItemsResponseFirstSub);
    if ( !uaStatus.isGood() )
    {
        addError( "createMonitoredItems() for the first subscription returned bad status: " + uaStatus, uaStatus );
        return;
    }

    if( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequestFirstSub, createMonitoredItemsResponseFirstSub ) )
    {
        addLog ( numItemsToMonitorFirstSub + " monitored items successfully created in the first subscription." );

        // Add monitored items using default parameters to the second subscription
        createMonitoredItemsRequestSecondSub = new UaCreateMonitoredItemsRequest();
        createMonitoredItemsResponseSecondSub = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequestSecondSub.RequestHeader );

        createMonitoredItemsRequestSecondSub.SubscriptionId = SecondSubscription.SubscriptionId;
        createMonitoredItemsRequestSecondSub.TimestampsToReturn = TimestampsToReturn.Both;

        clientHandle = 0;
        var numItemsToMonitorSecondSub = 4;
        addLog ( "\nSTEP 2: Adding " + numItemsToMonitorSecondSub + " monitored items to the first subscription." );
        for( i = 0; i< numItemsToMonitorSecondSub; i++ )
        {
            createMonitoredItemsRequestSecondSub.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
            createMonitoredItemsRequestSecondSub.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
            createMonitoredItemsRequestSecondSub.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
            createMonitoredItemsRequestSecondSub.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
            createMonitoredItemsRequestSecondSub.ItemsToCreate[i].RequestedParameters.SamplingInterval = -1;
            createMonitoredItemsRequestSecondSub.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
            createMonitoredItemsRequestSecondSub.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
        }

        createMonitoredItemsRequestSecondSub.ItemsToCreate[0].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" ).id;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[1].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( "uid" ).id;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[2].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( "diu" ).id;
        createMonitoredItemsRequestSecondSub.ItemsToCreate[3].ItemToMonitor.NodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( "dui" ).id;

        uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequestSecondSub, createMonitoredItemsResponseSecondSub );
        if ( !uaStatus.isGood() )
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
        else
        {
            if( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequestSecondSub, createMonitoredItemsResponseSecondSub ) )
            {
                addLog ( numItemsToMonitorSecondSub + " monitored items successfully created in the second subscription." );
                addLog ( "STEP 3: Ready to SetMonitoringMode(using subscription ID of the first subscription, and monitored items of both the first and second subscription. )" );
                // Set the monitoringmode to disabled
                var setMonitoringModeRequestFirstSub = new UaSetMonitoringModeRequest();
                var setMonitoringModeResponseFirstSub = new UaSetMonitoringModeResponse();
                g_session.buildRequestHeader( setMonitoringModeRequestFirstSub.RequestHeader );
                setMonitoringModeRequestFirstSub.MonitoringMode = MonitoringMode.Disabled;

                // Using the first subscription
                setMonitoringModeRequestFirstSub.SubscriptionId = FirstSubscription.SubscriptionId;

                // Monitored items belonging to the first subscription
                var expectedOperationResultArray = [];
                for( i = 0; i < numItemsToMonitorFirstSub; i++ )
                {
                    setMonitoringModeRequestFirstSub.MonitoredItemIds[i] = createMonitoredItemsResponseFirstSub.Results[i].MonitoredItemId;
                    expectedOperationResultArray[i] = new ExpectedAndAcceptedResults( StatusCode.Good );
                }

                // Monitored items belonging to the second subscription (whose IDs
                // aren't identical to the monitored items in the first subscription)
                var n = numItemsToMonitorFirstSub;
                for( i = 0; i < numItemsToMonitorSecondSub; i++ )
                {
                    var found = false;
                    for( var j = 0; j < numItemsToMonitorFirstSub; j++ )
                    {
                        if( createMonitoredItemsResponseFirstSub.Results[j].MonitoredItemId === createMonitoredItemsResponseSecondSub.Results[i].MonitoredItemId )
                        {
                            found = true;
                        }
                    }
                    if( !found )
                    {
                        setMonitoringModeRequestFirstSub.MonitoredItemIds[n] = createMonitoredItemsResponseSecondSub.Results[i].MonitoredItemId;
                        expectedOperationResultArray[n] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid  );
                        n++;
                    }
                }
                if( expectedOperationResultArray.length <= numItemsToMonitorFirstSub )
                {
                    addError( "Test cannot be completed: No monitored items in the second subscription could be differentiated from the items in the first subscription." );
                    return;
                }

                uaStatus = g_session.setMonitoringMode( setMonitoringModeRequestFirstSub, setMonitoringModeResponseFirstSub );
                if( !uaStatus.isGood() )
                {
                    addError( "setMonitoringMode() returned bad status: " + uaStatus, uaStatus );
                }

                checkSetMonitoringModeError ( setMonitoringModeRequestFirstSub, setMonitoringModeResponseFirstSub, expectedOperationResultArray );
            }
        }
    }

    // Clean up
    // Delete the items we added to the first subscription
    var monitoredItemsIdsToDelete = new UaUInt32s();
    for( i = 0; i< createMonitoredItemsResponseFirstSub.Results.length; i++ )
    {
        monitoredItemsIdsToDelete[i] = createMonitoredItemsResponseFirstSub.Results[i].MonitoredItemId;
    }
    deleteMonitoredItems( monitoredItemsIdsToDelete, FirstSubscription, g_session );

    // Delete the items we added to the second subscription
    monitoredItemsIdsToDelete = new UaUInt32s();
    for( i = 0; i< createMonitoredItemsResponseSecondSub.Results.length; i++ )
    {
        monitoredItemsIdsToDelete[i] = createMonitoredItemsResponseSecondSub.Results[i].MonitoredItemId;
    }        
    deleteMonitoredItems( monitoredItemsIdsToDelete, SecondSubscription, g_session );

    // Delete the second subscription (first subscription will be deleted in the common cleanup code)
    deleteSubscription( SecondSubscription, g_session );
}

safelyInvoke( setMonitoringMode593Err008 );