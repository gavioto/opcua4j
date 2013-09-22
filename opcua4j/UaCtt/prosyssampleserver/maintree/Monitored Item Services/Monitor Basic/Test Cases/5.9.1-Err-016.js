/*  Test 5.9.1 Error Test 16 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies an attribute (not .Value) and the filter criteria:
        Absolute deadband.

    Revision History
        09-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        02-Dec-2009 NP: Revised to meet new test-case requirements.
*/

function createMonitoredItems591Err016()
{
    var scalarNode = NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "iud" );
    if( scalarNode == null )
    {
        addSkipped( "Static Scalar" );
        return;
    }
    var items = [ MonitoredItem.fromSetting( scalarNode.name, 0 ) ];

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created." );
    }
    else
    {
        // Create two monitored items: Both with Absolute deadband filter
        for ( var x=0; x<2; x++ )
        { 
            // Create monitored item
            var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
            var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
            g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

            createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
            createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;
            createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
            createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = items[0].NodeId;
            createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.DisplayName;
            createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
            createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0x1234;
            createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
            createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
            createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

            // define the filter (deadband)
            var filter = Event.GetDataChangeFilter( DeadbandType.Absolute, 10, DataChangeTrigger.StatusValue );
            createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.Filter = filter;

            // Message as to which filter being specified for this item
            if ( x === 0 )
            {
                addLog ( "Creating one monitored item with Absolute deadband filter." );
            }
            else
            {
                addLog ( "Creating one monitored item with Percent deadband filter." );
            }

            var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
            if( uaStatus.isGood() )
            {
                addLog ( "Result is:" );
                var expectedOperationResult = [];
                expectedOperationResult[0] = new ExpectedAndAcceptedResults( StatusCode.BadFilterNotAllowed);
                expectedOperationResult[0].addExpectedResult( StatusCode.BadMonitoredItemFilterUnsupported);
                checkCreateMonitoredItemsError( createMonitoredItemsRequest, createMonitoredItemsResponse, expectedOperationResult );

                if( createMonitoredItemsResponse.Results[0].StatusCode.StatusCode === StatusCode.BadMonitoredItemFilterUnsupported )
                {
                    if( x === 0 )
                    {
                        addNotSupported( "DeadbandAbsolute" );
                    }
                    else
                    {
                        addNotSupported( "PercentDeadband" );
                    }
                }

                // clean up (if required)
                if( createMonitoredItemsResponse.Results[0].StatusCode.isGood() )
                {
                    deleteMonitoredItems( [ createMonitoredItemsResponse.Results[0].MonitoredItemId ], MonitorBasicSubscription, g_session );
                }
            }
            else
            {
                addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
            }
        }
    }
}

safelyInvoke( createMonitoredItems591Err016 );