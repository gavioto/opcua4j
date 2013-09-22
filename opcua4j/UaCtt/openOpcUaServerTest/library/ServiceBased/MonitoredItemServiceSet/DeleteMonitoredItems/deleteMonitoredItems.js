include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/check_deleteMonitoredItems_error.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/check_deleteMonitoredItems_failed.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/check_deleteMonitoredItems_valid.js" );

// deletes all monitoredItems from the subscirption
// MonitoredItemIds is of type UaUint32s or MonitoredItem object
// Subscription is of type Subscription defined in Lib/Base/Objects/subscription.js
// Session is of type UaSession
function deleteMonitoredItems( MonitoredItemIds, Subscription, Session, ExpectedErrors, ExpectErrorNotFail, suppressMessaging )
{
    var bSucceeded = true;

    // check in parameters
    if( arguments.length < 3 )
    {
        addError( "function deleteMonitoredItems(MonitoredItemIds, Subscription, Session): Number of arguments must be at least 3!" );
        return false;
    }

    // allow the developer to be lazy. The "monitoredItemIds" parameter is expected to be an 
    // array of Integers (MonitoredItemId). However, if it is an array of MonitoredItem objects 
    // then ALLOW IT, because we can convert those to just the monitoredItemIds ourselves.
    // We are going to ASSUME that the array elements are all of the same type, so take a look 
    // at the first element to see if it is a monitoredItem object.
    // FIRST, is it an array?
    var itemIdsToRemove = [];
    if( MonitoredItemIds.length === undefined )
    {
        // is it an integer or monitoredItem?
        if( MonitoredItemIds.MonitoredItemId !== undefined )
        {
            // monitoredItem
            itemIdsToRemove[0] = MonitoredItemIds.MonitoredItemId;
        }
        else
        {
            //integer
            itemIdsToRemove[0] = MonitoredItemIds;
        }
        MonitoredItemIds = [MonitoredItemIds];
    }
    else if( MonitoredItemIds.length > 0 )
    {
        // an array, of MonitoredItems? or integers?
        if( MonitoredItemIds[0].MonitoredItemId !== undefined )
        {
            itemIdsToRemove = MonitoredItem.toIdsArray( MonitoredItemIds );
        }
        else
        {
            itemIdsToRemove = MonitoredItemIds;
        }
    }

    if( itemIdsToRemove.length === 0 )
    {
        return;
    }
    
    var deleteMonitoredItemsRequest = new UaDeleteMonitoredItemsRequest();
    var deleteMonitoredItemsResponse = new UaDeleteMonitoredItemsResponse();
    Session.buildRequestHeader( deleteMonitoredItemsRequest.RequestHeader );

    if( suppressMessaging === undefined || suppressMessaging == false ) addLog( "Delete '" + itemIdsToRemove.length + "' MonitoredItems from subscription: '" + Subscription.SubscriptionId + "'" );
    deleteMonitoredItemsRequest.SubscriptionId = Subscription.SubscriptionId;

    for( var i=0, n=0; i < itemIdsToRemove.length; i++ )
    {
        // ignore bad MonitoredItemIds
        if( itemIdsToRemove[i] !== 0 )
        {
            deleteMonitoredItemsRequest.MonitoredItemIds[n] = itemIdsToRemove[i];
            if( MonitoredItemIds[n].NodeId !== undefined )
            {
                if( suppressMessaging === undefined || suppressMessaging == false ) print( "\tRemoving nodeId '" + MonitoredItemIds[n].NodeId + "' (setting: '" + MonitoredItemIds[n].NodeSetting + "') " );
            }
            n++;
        }
    }

    var uaStatus = Session.deleteMonitoredItems( deleteMonitoredItemsRequest, deleteMonitoredItemsResponse );
    if( uaStatus.isGood() )
    {
        //ExpectedErrors, ExpectErrorNotFail
        if( ExpectedErrors !== undefined && ExpectedErrors !== null && ExpectErrorNotFail !== undefined && ExpectErrorNotFail !== null )
        {
            if( ExpectErrorNotFail )
            {
                bSucceeded = checkDeleteMonitoredItemsError( deleteMonitoredItemsRequest, deleteMonitoredItemsResponse, ExpectedErrors );
            }
            else
            {
                bSucceeded = checkDeleteMonitoredItemsFailed( deleteMonitoredItemsRequest, deleteMonitoredItemsResponse, ExpectedErrors );
            }
        }
        else
        {
            bSucceeded = checkDeleteMonitoredItemsValidParameter( deleteMonitoredItemsRequest, deleteMonitoredItemsResponse );
        }
    }
    else
    {
        addError( "DeleteMonitoredItems() status " + uaStatus, uaStatus );
        bSucceeded = false;
    }

    return bSucceeded;
}