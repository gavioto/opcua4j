/*  Test 5.9.2 Error Test 9 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies empty ItemsToModify array.

    Revision History
        07-Oct-2009 AT: Initial Version.
        18-Nov-2009 NP: REVIEWED.
*/

function modifyMonitoredItems592Err009()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created" );
        return;
    }

    // No need to create monitored items for this test    
    print( "Not creating any monitored items for this test as we will be specifying an empty ItemsToModify[]." );
    print( "Calling modifyMonitoredItems with empty ItemsToModify[]." );

    // Call modifyMonitoredItems with empty ItemsToModify
    var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
    var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
    g_session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

    modifyMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

    uaStatus = g_session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );
    if( !uaStatus.isGood() )
    {
        addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
        return;
    }

    // Check the results of the modification.
    var ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
    checkModifyMonitoredItemsFailed( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse, ExpectedServiceResult );
}

safelyInvoke( modifyMonitoredItems592Err009 );