/*  Test 5.9.1 Error Test 2, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Creates multiple monitoredItems while specifying an invalid subscriptionId.
        Expected result = Bad_SubscriptionIdInvalid.

        subscription is created and deleted in initialize and cleanup scripts

    Revision History
        Sep-16-2009 Dev: Initial version.
        Nov-16-2009 NP:  REVIEWED.
        Feb-02-2010 DP: Changed to use static scalar nodes instead of arrays. For the
                    test, it's irrelevant which one is used, but a server is more likely
                    to have scalars than arrays.
*/

function createMonitoredItems591Err002()
{
    var nodeNames = NodeIdSettings.ScalarStatic();

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }
    else
    {
        // Create a single monitored item using an invalid subscriptionID
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

         //dynamically construct the IDs of the nodes we want to read, specifically their values.
        for( var i=0; i<nodeNames.length; i++ )
        {
            //get the value of the setting, and make sure it contains a value
            var settingValue = readSetting( nodeNames[i] );
            if( settingValue.toString() == "undefined" )
            {
                settingValue = "";
            }

            if( settingValue.toString().length > 0 )
            {
                createMonitoredItemsRequest.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
                createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.NodeId = UaNodeId.fromString( settingValue.toString() );
                createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
                createMonitoredItemsRequest.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
                createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle = i;
                createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.SamplingInterval = 1000;
                createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
                createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
            }
        }
        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId + 10;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

        addLog( "Calling CreateMonitoredItems with '" + createMonitoredItemsRequest.ItemsToCreate.length + "' items being requested." );

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            var ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
            checkCreateMonitoredItemsFailed( createMonitoredItemsRequest, createMonitoredItemsResponse, ExpectedServiceResult );
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( createMonitoredItems591Err002 );