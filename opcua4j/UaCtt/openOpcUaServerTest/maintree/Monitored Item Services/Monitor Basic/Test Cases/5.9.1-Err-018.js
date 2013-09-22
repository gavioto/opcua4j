/*  Test 5.9.1 Error Test 18, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        CreateMonitoredItems uses the following parameter values: 
const       MODE   = MonitoringMode.Disabled;
const       FILTER = null;
const       QUEUE  = 1;
const       TIMES  = 0x12345; 
        Expected to fail:
          Bad_TimestampsToReturnInvalid.

        subscription is created and deleted in initialize and cleanup scripts

    Revision History
        Sep-16-2009 NP: Initial version.
        Nov-16-2009 NP: REVIEWED.
*/

function createMonitoredItems591Err018( mode, filter, queueLength, timestamps, item )
{
    if( arguments.length != 5 )
    {
        addError( "createMonitoredItems591001 requires 5 arguments!" );
        return;
    }
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created." );
        return;
    }
    addLog( "\nCreate monitored Items: Mode: " + mode +
        "; Filter: " + filter +
        "; QueueSize: " + queueLength +
        "; Timestamps to retun: " + timestamps.toString() +
        "\n" );

    // add one monitored item using default parameters
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

    createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = timestamps;
    createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = item.NodeId;
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
    createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = mode;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0x1234;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = queueLength;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

    var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
    if( uaStatus.isGood() )
    {
        var ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadTimestampsToReturnInvalid );
        checkCreateMonitoredItemsFailed( createMonitoredItemsRequest, createMonitoredItemsResponse, ExpectedServiceResult );

        // delete the items we added in this test
        var monitoredItemsIdsToDelete = new UaUInt32s();
        for( var i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
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

function test591Err018()
{
    const MODE   = MonitoringMode.Disabled;
    const FILTER = null;
    const QUEUE  = 1;
    const TIMES  = 0x12345;

    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    createMonitoredItems591Err018( MODE, FILTER, QUEUE, TIMES, items[0] );
}

safelyInvoke( test591Err018 );