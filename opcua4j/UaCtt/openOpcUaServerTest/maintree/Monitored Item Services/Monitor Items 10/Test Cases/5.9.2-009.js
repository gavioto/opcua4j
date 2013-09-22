/*  Test 5.9.2 Test 9 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Modify the samplingInterval of multiple nodes, where the first half 
        are set to 1000 msec and the latter half 3000 msec.
        Where initial configuration is:
            A subscription of 10 (or more) monitoredItems using default parameters

    Revision History
        07-Oct-2009 NP: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        22-Jan-2010 DP: Changed to get NodeIds from a library function.
*/

function modifyMonitoredItems592009()
{
    const INITIALSCANERATE = 500;
    const MODIFIEDSCANRATE = 1000;

    // array to store the NodeIds from the settings
    var itemsToMonitorNodeIds = NodeIdSettings.getScalarStaticUniqueNodeIds( 13 );

    // check that we have 10 nodes to work with
    if( itemsToMonitorNodeIds.length < 10 )
    {
        addWarning( "Can't test because not enough nodes are defined. We need 10, but only " + itemsToMonitorNodeIds.length + " exist." );
    }
    else
    {
        // if we get here then we have 10 or more nodes to work with. So first of all lets 
        // just take the first 10
        
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
        var numItemsToMonitor = 10;
        print( "Creating " + numItemsToMonitor + " monitored items using the default sampling interval." );
        var i;
        for( i=0; i<numItemsToMonitor; i++ )
        {
            createMonitoredItemsRequest.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
            createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.NodeId = itemsToMonitorNodeIds[i];
            createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
            createMonitoredItemsRequest.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.SamplingInterval = INITIALSCANERATE;
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


        var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
        var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
        g_session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

        modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;

        // Modify the  monitoredItems; Specify a sampling interval of 1000ms for first 5 items
        var m;
        for( m=0; m<5; m++ )
        {
            modifyMonitoredItemsRequest.ItemsToModify[m].MonitoredItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;
            modifyMonitoredItemsRequest.ItemsToModify[m].RequestedParameters.SamplingInterval = MODIFIEDSCANRATE;
        }

        // Modify the monitoredItems; Specify a sampling interval of 3000ms for re,aomomg items
        for( m=5; m<10; m++ )
        {
            modifyMonitoredItemsRequest.ItemsToModify[m].MonitoredItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;
            modifyMonitoredItemsRequest.ItemsToModify[m].RequestedParameters.SamplingInterval = MODIFIEDSCANRATE * 3;
        }


        uaStatus = g_session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );        
        if( !uaStatus.isGood() )
        {
            addError( "ModifyMonitoredItems() status " + uaStatus );
        }


        // Check the results of the modification.
        checkModifyMonitoredItemsValidParameter( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );

        // Cleanup
        // Delete the items we added in this test
        var monitoredItemsIdsToDelete = new UaUInt32s();
        for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
        {
            monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
        }        
        deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorBasicSubscription, g_session );
    }
}

safelyInvoke( modifyMonitoredItems592009 );