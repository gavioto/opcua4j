/*  Test 5.9.5 Error Test 6 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies empty monitoredItemIds[].

    Revision History
        03-Oct-2009 AT: Initial version.
        18-Nov-2009 NP: REVIEWED.
*/

function deleteMonitoredItems595Err006()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }
    else
    {
        // No need to create monitored items for this test
        // Delete monitored items
        var deleteMonitoredItemsRequest = new UaDeleteMonitoredItemsRequest();
        var deleteMonitoredItemsResponse = new UaDeleteMonitoredItemsResponse();
        g_session.buildRequestHeader( deleteMonitoredItemsRequest.RequestHeader );

        deleteMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        // Empty MonitoredItemIds array!!

        uaStatus = g_session.deleteMonitoredItems( deleteMonitoredItemsRequest, deleteMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            var ExpectedOperationResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
            checkDeleteMonitoredItemsFailed ( deleteMonitoredItemsRequest, deleteMonitoredItemsResponse, ExpectedOperationResult );
        }
        else
        {
            addError( "DeleteMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( deleteMonitoredItems595Err006 );