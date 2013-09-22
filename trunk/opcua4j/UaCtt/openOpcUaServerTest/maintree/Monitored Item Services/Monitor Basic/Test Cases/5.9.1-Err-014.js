/*  Test 5.9.1 Error Test 14 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies a deadband filter, on a server that does not support deadbands.

    Revision History
        09-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        13-Dec-2009 DP: Find a configured node setting instead (instead of using one that may or may not be set).
        10-Dec-2010 NP: Corrected the unsupported code to BadMonitoredItemFilterUnsupported instead of BadFilterNotAllowed.
*/

function createMonitoredItems591Err014()
{
    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( nodeSetting === undefined || nodeSetting === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    var nodeId = UaNodeId.fromString( readSetting( nodeSetting.name ).toString() );
    if( nodeId === null )
    {
        addError( "Test cannot be completed: setting " + nodeSetting.name + " did not resolve to a valid NodeId" );
        return;
    }

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created." );
    }
    else
    {
        // define the filter (deadband)
        var filter = Event.GetDataChangeFilter( DeadbandType.Absolute, 10, DataChangeTrigger.StatusValue )

        // Create a single monitored item with a deadband filter
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;
        createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = nodeId;
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0x1234;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

        // add the deadband filter
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.Filter = filter;

        addLog ( "Creating one monitored item with a deadband filter." );
        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            addLog ( "Result is:" );
            var expectedOperationResult = [];
            expectedOperationResult[0] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemFilterUnsupported );
            expectedOperationResult[0].addExpectedResult( StatusCode.Good );
            checkCreateMonitoredItemsError( createMonitoredItemsRequest, createMonitoredItemsResponse, expectedOperationResult );

            // Post the appropriate message
            if ( createMonitoredItemsResponse.Results[0].StatusCode.StatusCode == StatusCode.BadMonitoredItemFilterUnsupported )
            {
                _notSupported.store( "DeadbandAbsolute" );
            }
            else if ( createMonitoredItemsResponse.Results[0].StatusCode.StatusCode == StatusCode.Good )
            {
                addLog( "The UA server supports deadband filter." );
            }
            else
            {
                // Unexpected result
                addError( "The UA server returned an unexpected operation level result: " + createMonitoredItemsResponse.Results[0].StatusCode );
            }

            // clean up - which "might" fail, if the Server didn't support deadband and therefor didnt add the item
            expectedOperationResult[0] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
            expectedOperationResult[0].addExpectedResult( StatusCode.Good );
            deleteMonitoredItems( [ createMonitoredItemsResponse.Results[0].MonitoredItemId ], MonitorBasicSubscription, g_session, expectedOperationResult, true );
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( createMonitoredItems591Err014 );