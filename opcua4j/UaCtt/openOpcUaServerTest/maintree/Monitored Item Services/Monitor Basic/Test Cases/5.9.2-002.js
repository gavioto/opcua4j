/*  Test 5.9.2 Test 2, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Modifies a single monitoredItem setting:

        const TIMESTAMPS = TimestampsToReturn.Source;

        subscription is created and deleted in initialize and cleanup scripts
        
    Revision History
        Sep-16-2009 NP: Initial version.
        Nov-16-2009 NP: Added verification to the timestamps via a call to Publish.
                        REVIEWED.
        Dec-14-2009 DP: Changed to find available NodeIds from settings.
        Dec-15-2009 DP: Changed to create only one monitored item.
        Mar-23-2011 NP: Switched to STATIC node. Now writes a value to control the dataChange(s).
                        Removed parameters from ModifyMonitoredItems that the test-case did not want modified.
*/

function test592002( timestamps )
{
    if(!MonitorBasicSubscription.SubscriptionCreated)
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }
    else
    {
        // add 3 monitored items using default parameters
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

        var item1 = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting( "uid" ).name );
        if( item1 === undefined || item1 === null )
        {
            addSkipped( "Static Scalar (numeric)" );
            return;
        }
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = item1.NodeId;

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if ( uaStatus.isGood() )
        {
            if( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse ) )
            {
                // call publish, and verify that we received BOTH timestamps for all items
                addLog( "Waiting " + MonitorBasicSubscription.RevisedPublishingInterval + "ms" );
                wait( MonitorBasicSubscription.RevisedPublishingInterval );
                publishService.Execute();
                if( AssertEqual( true, publishService.CurrentlyContainsData(), "Expected the initial DataChange notifications but did not receive any." ) )
                {
                    publishService.ValidateTimestampsInAllDataChanges( createMonitoredItemsRequest.TimestampsToReturn );
                    // update our item with the value just received
                    item1.Value = publishService.CurrentDataChanges[0].MonitoredItems[0].Value;
                }

                // write a value to the nodes
                print( "Prior value of item1: " + item1.Value.Value.toString() );
                item1.SafelySetValueTypeKnown( 1 + UaVariantToSimpleType(item1.Value.Value), item1.Value.Value.DataType );
                WriteHelper.Execute( item1 );
                
                // modify a single monitored item
                var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
                var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
                g_session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

                modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
                modifyMonitoredItemsRequest.TimestampsToReturn = timestamps;
                modifyMonitoredItemsRequest.ItemsToModify[0].MonitoredItemId = createMonitoredItemsResponse.Results[0].MonitoredItemId;
                modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.ClientHandle = 1;
                modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.SamplingInterval = -1;
                modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.QueueSize = 1;
                modifyMonitoredItemsRequest.ItemsToModify[0].RequestedParameters.DiscardOldest = true;

                uaStatus = g_session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );

                if( uaStatus.isGood() )
                {
                    checkModifyMonitoredItemsValidParameter( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );
                }
                else
                {
                    addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
                }

                addLog( "Waiting " + MonitorBasicSubscription.PublishingInterval + "ms" );
                wait( MonitorBasicSubscription.RevisedPublishingInterval );
                publishService.Execute();
                if( AssertEqual( true, publishService.CurrentlyContainsData(), "Expected a DataChange but did not receive one. The node was updated prior to being updated with ModifyMonitoredItems." ) )
                {
                    publishService.ValidateTimestampsInDataChange( publishService.CurrentDataChanges[0], modifyMonitoredItemsRequest.TimestampsToReturn );
                }

                // delete the items we added in this test
                var monitoredItemsIdsToDelete = new UaUInt32s();
                for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
                {
                    monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
                }
                deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorBasicSubscription, g_session );
            }
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
    publishService.Clear();
}

function modifyMonitoredItem592002()
{
    test592002( TimestampsToReturn.Source );
}

safelyInvoke( modifyMonitoredItem592002 );