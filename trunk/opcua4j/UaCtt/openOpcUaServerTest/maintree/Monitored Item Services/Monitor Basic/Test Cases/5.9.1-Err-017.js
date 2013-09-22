/*  Test 5.9.1 Error Test 17, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Do not specify any itemsToCreate.

        subscription is created and deleted in initialize and cleanup scripts

    Revision History
        Sep-16-2009 NP: Initial version.
        Nov-16-2009 NP: REVIEWED.
*/

function createMonitoredItems591Err017()
{
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
       
        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId + 10;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            var ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
            checkCreateMonitoredItemsFailed( createMonitoredItemsRequest, createMonitoredItemsResponse, ExpectedServiceResult );
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( createMonitoredItems591Err017 );