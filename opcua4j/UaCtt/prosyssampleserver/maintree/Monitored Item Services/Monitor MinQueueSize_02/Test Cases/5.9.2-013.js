/*  Test 5.9.2 Test 13 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script modifies QueueSize for multiple items(5), the first half at 0 the remainder at 2.
        Expected Result: 
            ServiceResult = Good
            The UA server should revise the queueSize to be non-zero where we request '0'

    Revision History
        08-Oct-2009 AT: Initial Version (based on 5.9.2-010 by Nathan Pocock).
        16-Nov-2009 NP: REVIEWED.
        12-Jan-2010 DP: Expanded the number of NodeId settings that will be searched.
        09-Jun-2010 NP: Revised SamplingInterval to 0, from -1.
        13-Jul-2010 DP: Use more of the scalar static settings when available.
*/

function modifyMonitoredItems592013()
{
    const FIRST_HALF_QUEUE_SIZE = 0;
    const SECOND_HALF_QUEUE_SIZE = 2;

    // specify more items than we need, just in case any are not configured
    var itemsToMonitorSettingNames = NodeIdSettings.ScalarStaticAll();

    // array to store the NodeIds from the settings
    var itemsToMonitorNodeIds = [];

    // get the values of the settings
    for( var s=0; s<itemsToMonitorSettingNames.length; s++ )
    {
        var settingValue = readSetting( itemsToMonitorSettingNames[s] );
        if( settingValue !== undefined && settingValue !== null && settingValue.toString() !== "" )
        {
            itemsToMonitorNodeIds.push( settingValue.toString() );
        }
    }

    // check that we have 5 nodes to work with
    if( itemsToMonitorNodeIds.length < 5 )
    {
        addWarning( "Test cannot be completed: not enough nodes are configured in Settings. 5 are required, but " + itemsToMonitorNodeIds.length + " exist." );
    }
    else
    {
        if( !MonitorQueueSize2Subscription.SubscriptionCreated )
        {
            addError( "Subscription for Monitor Basic was not created" );
            return;
        }

        // Add 5 monitored items using default parameters
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader(createMonitoredItemsRequest.RequestHeader);

        createMonitoredItemsRequest.SubscriptionId = MonitorQueueSize2Subscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

        var clientHandle = 0;
        var numItemsToMonitor = 5;
        addLog ( "Creating " + numItemsToMonitor + " monitored items using the default sampling interval." );
        for( var i = 0; i< numItemsToMonitor; i++ )
        {
            createMonitoredItemsRequest.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
            createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.NodeId = UaNodeId.fromString( itemsToMonitorNodeIds[i] );
            createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
            createMonitoredItemsRequest.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.SamplingInterval = 0;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
        }

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if ( !uaStatus.isGood() )
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
            return;
        }

        checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );
        print( "Successfully created the " + numItemsToMonitor + " monitored items." );

        // Now modify the QueueSize for first 2 monitoredItems to FIRST_HALF_QUEUE_SIZE
        // and the remaining 3 items to SECOND_HALF_QUEUE_SIZE
        print( "Modifying the " + numItemsToMonitor + " items. Setting the QueueSize for the first two items to '" + FIRST_HALF_QUEUE_SIZE + "' and the remaining three items to '" + SECOND_HALF_QUEUE_SIZE + "'.");

        var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
        var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
        g_session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

        modifyMonitoredItemsRequest.SubscriptionId = MonitorQueueSize2Subscription.SubscriptionId;
        modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

        // First 2 items to FIRST_HALF_QUEUE_SIZE
        for( var f=0; f<2; f++ )
        {
            modifyMonitoredItemsRequest.ItemsToModify[f].MonitoredItemId = createMonitoredItemsResponse.Results[f].MonitoredItemId;
            modifyMonitoredItemsRequest.ItemsToModify[f].RequestedParameters.QueueSize = FIRST_HALF_QUEUE_SIZE;
        }

        // Remaining 3 items to SECOND_HALF_QUEUE_SIZE
        for( f=2; f<5; f++ )
        {
            modifyMonitoredItemsRequest.ItemsToModify[f].MonitoredItemId = createMonitoredItemsResponse.Results[f].MonitoredItemId;
            modifyMonitoredItemsRequest.ItemsToModify[f].RequestedParameters.QueueSize = SECOND_HALF_QUEUE_SIZE;
        }

        uaStatus = g_session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );        
        if( !uaStatus.isGood() )
        {
            addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
        }
        else
        {
            print( "Modified the items. The results are:" );
            // Check the results of the modification.
            checkModifyMonitoredItemsValidParameter( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );

            // For the first two items the server should revise the QueueSize to '1' based on our request to set it to '0'
            for( f=0; f<2; f++ )
            {
                if ( modifyMonitoredItemsResponse.Results[f].RevisedQueueSize == 0 )
                {
                    addError ( "Error! The UA server accepted the QueueSize of '0' for item #" + f + ". This is not allowed." );
                }
                else if ( modifyMonitoredItemsResponse.Results[f].RevisedQueueSize > 0 )
                {
                    print( "The UA server revised the QueueSize for item #" + f + " to non-zero as expected." );
                }
            }

            // For the remaining three items the server could either accept our request queuesize or revise it. 
            for( f=2; f<5; f++ )
            {
                if ( modifyMonitoredItemsResponse.Results[f].RevisedQueueSize == modifyMonitoredItemsRequest.ItemsToModify[f].RequestedParameters.QueueSize )
                {
                    print( "The UA server accepted the QueueSize of '" + modifyMonitoredItemsRequest.ItemsToModify[f].RequestedParameters.QueueSize + "' for item #" + f + "." );
                }
                else
                {
                    print( "The UA server revised the QueueSize for item #" + f + " to '" + modifyMonitoredItemsResponse.Results[f].RevisedQueueSize + "'.");
                }
            }
        }
        // Cleanup
        // Delete the items we added in this test
        var monitoredItemsIdsToDelete = new UaUInt32s();
        for( var i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
        {
            monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
        }
        deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorQueueSize2Subscription, g_session );
    }
}

safelyInvoke( modifyMonitoredItems592013 );