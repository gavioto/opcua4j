/*  Test 5.9.3 Test 3 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script sets monitoring mode to 'Reporting' for a 'Disabled' monitor item. 
        Verifies that data is received(on publish) only when the monitoring mode 
        is 'Reporting'.

    Revision History
        06-Oct-2009 AT: Initial version.
        18-Nov-2009 NP: Revised to use new Publish object.
                        REVIEWED.
*/

function setMonitoringMode593003()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created" );
        return;
    }

    // Add 1 monitored item (disabled)
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

    createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

    createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
    createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Disabled;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = items[0].NodeId;

    var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
    if ( !uaStatus.isGood() )
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        return;
    }

    if( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse ) )
    {
        addLog( "Created 1 monitored(disabled) item successfully. Calling publish to verify we do not receive any datachange notification." );

        // wait one publishing cycle before calling publish
        wait( MonitorBasicSubscription.RevisedPublishingInterval );

        // Call publish, we should not receive any notification
        publishService.Execute();
        if( AssertEqual( false, publishService.CurrentlyContainsData(), "NotificationData received (first publish call) when none was expected for the disabled monitored item" ) )
        {
            addLog( "No NotificationData was received as expected. Setting the monitoring mode to 'Reporting' now." );

            // Set the monitoring mode to Reporting
            var setMonitoringModeRequest = new UaSetMonitoringModeRequest ();
            var setMonitoringModeResponse = new UaSetMonitoringModeResponse();
            g_session.buildRequestHeader( setMonitoringModeRequest.RequestHeader );

            setMonitoringModeRequest.MonitoringMode = MonitoringMode.Reporting;
            setMonitoringModeRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;    
            setMonitoringModeRequest.MonitoredItemIds[0] = createMonitoredItemsResponse.Results[0].MonitoredItemId;

            uaStatus = g_session.setMonitoringMode( setMonitoringModeRequest, setMonitoringModeResponse );        
            if( !uaStatus.isGood() )
            {
                addError( "SetMonitoringMode() status " + uaStatus, uaStatus );
            }
            else
            {
                checkSetMonitoringModeValidParameter( setMonitoringModeRequest, setMonitoringModeResponse );
                addLog( "Monitoring mode set to 'Reporting' successfully." );

                // Call Publish again to verify that we still do not receive any notification
                publishService.Execute();
                AssertEqual( true, publishService.CurrentlyContainsData(), "NotificationData not received (second publish call) when expected for the monitored item with monitoring mode 'Reporting'" );
            }
        }
    }
    // delete the items we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s();
    for( var i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
    {
        monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
    }
    deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorBasicSubscription, g_session );
    publishService.Clear();
}

safelyInvoke( setMonitoringMode593003 );