include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/check_createMonitoredItems_error.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/check_createMonitoredItems_failed.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/check_createMonitoredItems_valid.js" );

// creates a number of monitored items with default parameters
// MonitoredItems is an array of MonitoredItem Objects defined in lib/Base/Objects/monitoredItem.js
// Subscription is of type Subscription defined in lib/Base/Objects/subscription.js
// Session is of type UaSession
var createMonItemsRequ;
var createMonItemsResp;
function createMonitoredItems( MonitoredItems, TimestampsToReturn, Subscription, Session, ExpectedResults, ExpectErrorNotFail, suppressMessaging )
{
    var bSucceeded = true;
    var i;
    
    // check in parameters
    if( arguments.length < 4 )
    {
        addError( "function createMonitoredItems(MonitoredItems, TimestampsToReturn, Subscription, Session): Number of arguments must be 4 by minimum!" );
        return false;
    }
    // do we have any items to specify?
    if( MonitoredItems.length == 0 )
    {
        addError( "No items specified to createMonitoredItems." );
        return( false );
    }
    createMonItemsRequ = new UaCreateMonitoredItemsRequest();
    createMonItemsResp = new UaCreateMonitoredItemsResponse();
    Session.buildRequestHeader( createMonItemsRequ.RequestHeader );

    createMonItemsRequ.SubscriptionId = Subscription.SubscriptionId;
    createMonItemsRequ.TimestampsToReturn = TimestampsToReturn;

    if( MonitoredItems.length == undefined )
    {
        MonitoredItems = [ MonitoredItems ];
    }
    
    if( suppressMessaging === undefined || suppressMessaging == false ) addLog( "Creating " + MonitoredItems.length + " monitored items." );
    for( i = 0; i < MonitoredItems.length; i++ )
    {
        createMonItemsRequ.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
        createMonItemsRequ.ItemsToCreate[i].ItemToMonitor.AttributeId = MonitoredItems[i].AttributeId;
        createMonItemsRequ.ItemsToCreate[i].ItemToMonitor.NodeId = MonitoredItems[i].NodeId;
        createMonItemsRequ.ItemsToCreate[i].ItemToMonitor.IndexRange = MonitoredItems[i].IndexRange;
        createMonItemsRequ.ItemsToCreate[i].MonitoringMode = MonitoredItems[i].MonitoringMode;
        createMonItemsRequ.ItemsToCreate[i].RequestedParameters.ClientHandle = MonitoredItems[i].ClientHandle;
        createMonItemsRequ.ItemsToCreate[i].RequestedParameters.SamplingInterval = MonitoredItems[i].SamplingInterval;
        createMonItemsRequ.ItemsToCreate[i].RequestedParameters.QueueSize = MonitoredItems[i].QueueSize;
        createMonItemsRequ.ItemsToCreate[i].RequestedParameters.DiscardOldest = MonitoredItems[i].DiscardOldest;

        var message = "\t" + (1 + i ) + ".) NodeId: '" + MonitoredItems[i].NodeId +
            "'; (setting: '" + MonitoredItems[i].NodeSetting + "')" +
            "'; Attribute: '" + Attribute.toString( MonitoredItems[i].AttributeId ) +
            "'; IndexRange: '" + MonitoredItems[i].IndexRange +
            "'; Mode: '" + MonitoringMode.toString( createMonItemsRequ.ItemsToCreate[i].MonitoringMode ) + 
            "'; ClientHandle: '" + MonitoredItems[i].ClientHandle + "'";
        if( MonitoredItems[i].Filter !== undefined && MonitoredItems[i].Filter != null )
        {
            createMonItemsRequ.ItemsToCreate[i].RequestedParameters.Filter = MonitoredItems[i].Filter;
            message += "; Filter: '" + MonitoredItems[i].Filter + "'";
        }
        if( suppressMessaging === undefined || suppressMessaging == false ) addLog( message );
    }
    
    var uaStatus = Session.createMonitoredItems( createMonItemsRequ, createMonItemsResp );
    if( uaStatus.isGood() )
    {
        if( ExpectErrorNotFail === undefined )
        {
            bSucceeded = checkCreateMonitoredItemsValidParameter( createMonItemsRequ, createMonItemsResp, suppressMessaging );
        }
        else
        {
            if( ExpectErrorNotFail )
            {
                bSucceeded = checkCreateMonitoredItemsError( createMonItemsRequ, createMonItemsResp, ExpectedResults );
            }
            else
            {
                bSucceeded = checkCreateMonitoredItemsFailed( createMonItemsRequ, createMonItemsResp, ExpectedResults );
            }
        }

        for( i = 0; i < createMonItemsResp.Results.length; i++ )
        {
            var currentResult = createMonItemsResp.Results[i];
            if( currentResult.StatusCode.isGood() )
            {
                MonitoredItems[i].IsCreated = true;
                MonitoredItems[i].MonitoredItemId  = currentResult.MonitoredItemId;
                MonitoredItems[i].QueueSize        = currentResult.RevisedQueueSize;
                MonitoredItems[i].RevisedSamplingInterval = currentResult.RevisedSamplingInterval;
                if( currentResult.FilterResult !== null )
                {
                    var filterNodeId = currentResult.FilterResult.TypeId.NodeId.toString();
                    var emptyNodeId  = UaNodeId.fromString("i=0").toString();
                    if( filterNodeId !== emptyNodeId )
                    {
                        MonitoredItems[i].Filter = currentResult.FilterResult;
                    }
                }
                MonitoredItems[i].SubscriptionId   = Subscription.SubscriptionId;
            }
        }
    }
    else
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        bSucceeded = false;
    }
    
    return bSucceeded;
}