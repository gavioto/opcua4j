/*  Test 5.9.1 Error Test 3, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Creates multiple monitoredItems while specifying invalid NodeIds for all of them.
        Expected result = Bad_NodeIdInvalid or Bad_NodeIdUnknown.

        subscription is created and deleted in initialize and cleanup scripts

    Revision History
        Sep-16-2009 NP: Initial version.
        Nov-16-2009 NP: REVIEWED.
*/

function createMonitoredItems591Err003()
{
    var nodeNames = NodeIdSettings.InvalidNodeIds();

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
        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

        print( "Calling CreateMonitoredItems with '" + createMonitoredItemsRequest.ItemsToCreate.length + "' items being requested." );

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            // foreach monitored item we specified, we'll be happy to receive one of these error codes:
            //  a) bad_nodeIdUnknown
            //  b) bad_nodeIdInvalid
            var expectedServiceResult = []
            for( var i=0; i<createMonitoredItemsRequest.ItemsToCreate.length; i++ )
            {
                expectedServiceResult[i] = new ExpectedAndAcceptedResults();
                expectedServiceResult[i].addExpectedResult( StatusCode.BadNodeIdUnknown );
                expectedServiceResult[i].addExpectedResult( StatusCode.BadNodeIdInvalid );
            }

            // check the results and look for the above errors.
            checkCreateMonitoredItemsError( createMonitoredItemsRequest, createMonitoredItemsResponse, expectedServiceResult );
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( createMonitoredItems591Err003 );