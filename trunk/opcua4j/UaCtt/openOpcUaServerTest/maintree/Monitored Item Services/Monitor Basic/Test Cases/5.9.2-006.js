/*  Test 5.9.2 Test 6, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Modifies a single monitoredItem to use a QueueSize of 0.

        subscription is created and deleted in initialize and cleanup scripts

    Revision History
        Nov-24-2009 NP: Initial version.
                        REVIEWED.
        Dec-14-2009 DP: Changed to find available NodeIds from settings.
*/

function modifyMonitoredItem592006()
{
    var timestamps = TimestampsToReturn.Both;
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return;
    }

    // add 3 monitored items using default parameters
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

    createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = timestamps;

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
        addWarning( "No numeric nodeIds configured for testing. Aborting test." );
        return;
    }
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = setting1.id;
    
    setting1 = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Byte, BuiltInType.SByte, "u", "i", "d" ] );
    createMonitoredItemsRequest.ItemsToCreate[1].ItemToMonitor.NodeId = setting1.id;
    
    setting1 = NodeIdSettings.GetAScalarStaticNodeIdSetting( "diu" );
    createMonitoredItemsRequest.ItemsToCreate[2].ItemToMonitor.NodeId = setting1.id;

    var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
    if ( uaStatus.isGood() )
    {
        checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );

        // modify a single monitored item
        var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
        var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
        g_session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

        modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

        modifyMonitoredItemsRequest.ItemsToModify[0].MonitoredItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;
        modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.ClientHandle = 0;
        modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.DiscardOldest = true;
        modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.QueueSize = 0;
        modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.SamplingInterval = -1;

        uaStatus = g_session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            checkModifyMonitoredItemsValidParameter( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );
            for( var r=0; r<modifyMonitoredItemsResponse.Results.length; r++ )
            {
                print( "\tChecking ModifyMonitoredItems.Results[" + r + "].RevisedQueueSize != 0; current value=" + modifyMonitoredItemsResponse.Results[r].RevisedQueueSize );
                AssertNotEqual( 0, modifyMonitoredItemsResponse.Results[r].RevisedQueueSize, "Expected the Server to revise the queueSize from 0." );
            }
        }
        else
        {
            addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
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

safelyInvoke( modifyMonitoredItem592006 );