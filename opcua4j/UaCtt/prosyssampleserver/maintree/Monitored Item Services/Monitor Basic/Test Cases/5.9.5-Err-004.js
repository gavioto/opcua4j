/*  Test 5.9.5 Error Test 4 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies a valid subscriptionId, and multiple monitoredItemIds 
        of which some are valid and some are invalid.

    Revision History
        03-Oct-2009 AT: Initial version.
        18-Nov-2009 NP: REVIEWED/INCONCLUSIVE. OPCF UA Server returns BadUnexpectedError when deleting invalid items.
        13-Jul-2010 DP: Use additional scalar node settings.
*/

function deleteMonitoredItems595Err004()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStaticAll(), 0 );
    if( items == null || items.length < 5 )
    {
        addSkipped( "Static Scalar" );
        return;
    }
    
    // Number of items to create
    const NUMITEMSTOCREATE = 5;

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }
    else
    {    
        // add few monitored item using default parameters
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

        for ( var x=0; x<NUMITEMSTOCREATE; x++ )
        {
            createMonitoredItemsRequest.ItemsToCreate[x].ItemToMonitor.NodeId = items[x].NodeId;
            createMonitoredItemsRequest.ItemsToCreate[x].ItemToMonitor.AttributeId = Attribute.Value;
            createMonitoredItemsRequest.ItemsToCreate[x].MonitoringMode = MonitoringMode.Reporting;
            createMonitoredItemsRequest.ItemsToCreate[x].RequestedParameters.ClientHandle = x;
            createMonitoredItemsRequest.ItemsToCreate[x].RequestedParameters.SamplingInterval = -1;
            createMonitoredItemsRequest.ItemsToCreate[x].RequestedParameters.QueueSize = 1;
            createMonitoredItemsRequest.ItemsToCreate[x].RequestedParameters.DiscardOldest = true;
        }

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if ( uaStatus.isGood() )
        {
            if ( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse ) )
            {
                // delete monitored item
                var deleteMonitoredItemsRequest = new UaDeleteMonitoredItemsRequest();
                var deleteMonitoredItemsResponse = new UaDeleteMonitoredItemsResponse();
                g_session.buildRequestHeader( deleteMonitoredItemsRequest.RequestHeader );

                deleteMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
                // Lets specify indices 0,1,4 as invalid
                deleteMonitoredItemsRequest.MonitoredItemIds[0] = createMonitoredItemsResponse.Results[0].MonitoredItemId + 0x1234;
                deleteMonitoredItemsRequest.MonitoredItemIds[1] = createMonitoredItemsResponse.Results[1].MonitoredItemId + 0x1234;
                deleteMonitoredItemsRequest.MonitoredItemIds[2] = createMonitoredItemsResponse.Results[2].MonitoredItemId;
                deleteMonitoredItemsRequest.MonitoredItemIds[3] = createMonitoredItemsResponse.Results[3].MonitoredItemId;
                deleteMonitoredItemsRequest.MonitoredItemIds[4] = createMonitoredItemsResponse.Results[4].MonitoredItemId + 0x1234;

                uaStatus = g_session.deleteMonitoredItems( deleteMonitoredItemsRequest, deleteMonitoredItemsResponse );
                if( uaStatus.isGood() )
                {
                    // this is an array of ExpectedAndAcceptedResult.
                    var ExpectedOperationResultsArray = new Array(NUMITEMSTOCREATE);
                    ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
                    ExpectedOperationResultsArray[1] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
                    ExpectedOperationResultsArray[2] = new ExpectedAndAcceptedResults( StatusCode.Good );
                    ExpectedOperationResultsArray[3] = new ExpectedAndAcceptedResults( StatusCode.Good );
                    ExpectedOperationResultsArray[4] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
                    checkDeleteMonitoredItemsError( deleteMonitoredItemsRequest, deleteMonitoredItemsResponse, ExpectedOperationResultsArray );
                }
                else
                {
                    addError( "DeleteMonitoredItems() status " + uaStatus, uaStatus );
                }

                // delete the items we added in this test (ones that have not been deleted yet)
                var monitoredItemsIdsToDelete = [
                    createMonitoredItemsResponse.Results[0].MonitoredItemId,
                    createMonitoredItemsResponse.Results[1].MonitoredItemId,
                    createMonitoredItemsResponse.Results[4].MonitoredItemId ];
                deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorBasicSubscription, g_session );
            }
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( deleteMonitoredItems595Err004 );