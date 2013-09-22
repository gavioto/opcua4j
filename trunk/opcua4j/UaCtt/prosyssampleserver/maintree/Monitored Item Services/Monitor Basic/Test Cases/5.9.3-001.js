/*  Test 5.9.3 Test 1 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script sets monitoring mode to 'Disabled' for an already 'Disabled' monitor item. 
        Calls publish each time to verify that no notifications were received.

    Revision History
        05-Oct-2009 AT: Reworked script based on the revision to the corresponding test case.
        18-Nov-2009 NP: Revised to use new Publish script library object.
        21-Apr-2010 NP: Bugfix: Items are now initially created as DISABLED.
*/

function setMonitoringMode593001()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, MonitoringMode.Disabled, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addWarning( "Not enough nodes configured in Static Scalar!" );
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

    checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );
    print( "Created 1 monitored(disabled) item successfully. Calling publish to verify we do not receive any datachange notification." );

    // wait one publishing cycle before calling publish
    wait( MonitorBasicSubscription.RevisedPublishingInterval );

    // Call publish, we should not receive any notification
    addLog( "Calling Publish(first call) and initial data collection" );
    publishService.Execute();

    // Make sure we did not receive any datachange notification
    if( AssertEqual( false, publishService.CurrentlyContainsData(), "NotificationData received (first publish call) when none was expected for the disabled monitored item" ) )
    {
        print( "No NotificationData was received as expected. Setting the monitoring mode to 'Disabled' again." );

        // Set the monitoring mode to disabled again
        var setMonitoringModeRequest = new UaSetMonitoringModeRequest ();
        var setMonitoringModeResponse = new UaSetMonitoringModeResponse();
        g_session.buildRequestHeader( setMonitoringModeRequest.RequestHeader );

        setMonitoringModeRequest.MonitoringMode = MonitoringMode.Disabled;
        setMonitoringModeRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;    
        setMonitoringModeRequest.MonitoredItemIds[0] = createMonitoredItemsResponse.Results[0].MonitoredItemId;

        uaStatus = g_session.setMonitoringMode( setMonitoringModeRequest, setMonitoringModeResponse );        
        if( !uaStatus.isGood() )
        {
            addError( "SetMonitoringMode() status " + uaStatus, uaStatus );
        }

        checkSetMonitoringModeValidParameter( setMonitoringModeRequest, setMonitoringModeResponse );
        addLog( "Monitoring mode set to 'Disabled' successfully." );

        // Call Publish again to verify that we still do not receive any notification
        addLog ( "Calling publish again. We should not receive any NotificationData still. Do not acknowledge anything!" );    
        publishService.Execute();

        // Make sure we did not receive any datachange notification
        AssertEqual( false, publishService.CurrentlyContainsData(), "NotificationData received (second publish call) when none was expected for the disabled monitored item" );
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

safelyInvoke( setMonitoringMode593001 );