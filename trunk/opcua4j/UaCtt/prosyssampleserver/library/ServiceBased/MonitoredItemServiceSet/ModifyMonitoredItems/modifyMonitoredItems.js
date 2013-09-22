include( "./library/ServiceBased/MonitoredItemServiceSet/ModifyMonitoredItems/check_modifyMonitoredItems_valid.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/ModifyMonitoredItems/check_modifyMonitoredItems_error.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/ModifyMonitoredItems/check_modifyMonitoredItems_failed.js" );

/*  Nathan Pocock; nathan.pocock@opcfoundation.org
    This helper object simplifies the task of calling the ModifyMonitoredItems service call
    via the test-scripts.
    
        Methods:
            Execute = function( itemsToModify, timestampsToReturn, subscriptionObject, expectedResults, errorNotFail )

    Revision History:
        11-Dec-2009 NP: Initial version.
*/
function ModifyMonitoredItemsHelper( sessionObject )
{
    if( arguments.length == 0 )throw( "ModifyMonitoredItems() argument error." );
    if( sessionObject == null ) throw( "ModifyMonitoredItems() sessionObject argument error." );

    // properties within this object
    this.SessionObject = sessionObject;
    this.ModifyMonitoredItemsRequest  = new UaModifyMonitoredItemsRequest();
    this.ModifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
    this.uaStatus = null;

    /* Executes the call to ModifyMonitoredItems.
       Parameters:
           - itemsToModify       - MonitoredItems objects to modify
           - timestampsToReturn  - TimestampsToReturn
           - subscriptionObject  - Subscription object to use
           - expectedResults     - Array of ExpectedAndAcceptedResults
           - errorNotFail        - TRUE=expect Error, FALSE=expect Fail.
       Returns:
           TRUE:  the call completed as expected. Otherwise FALSE.
    */
    this.Execute = function( itemsToModify, timestampsToReturn, subscriptionObject, expectedResults, errorNotFail, suppressMessaging )
    {
        if( arguments.length < 3 )    throw( "ModifyMonitoredItems.Execute() argument error." );
        if( subscriptionObject == null )throw( "ModifyMonitoredItems.Execute() subscriptionObject argument error." );
        if( itemsToModify == null )     throw( "ModifyMonitoredItems.Execute() itemsToModify argument error." );
        if( itemsToModify.length == undefined )
        {
            itemsToModify = [ itemsToModify ];
        }
        if( suppressMessaging === undefined || suppressMessaging == false ) 
        {
            print( "ModifyMonitoredItems (helper)." );
            print( "\tItems to modify: " + itemsToModify.length + 
                "\n\t\tSubscriptionId: " + subscriptionObject.SubscriptionId + 
                "\n\t\tTimestampsToReturn: " + TimestampsToReturn.toString( timestampsToReturn ) );
        }
        // build the header
        this.ModifyMonitoredItemsRequest  = new UaModifyMonitoredItemsRequest();
        this.ModifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
        this.SessionObject.buildRequestHeader( this.ModifyMonitoredItemsRequest.RequestHeader );
        // specify the subscription and timestamp details
        this.ModifyMonitoredItemsRequest.SubscriptionId = subscriptionObject.SubscriptionId;
        this.ModifyMonitoredItemsRequest.TimestampsToReturn = timestampsToReturn;
        // now to modify the items themselves...
        if( suppressMessaging === undefined || suppressMessaging == false ) print( "\tModifying items as follows:" );
        for( var i=0; i<itemsToModify.length; i++ )
        {
            this.ModifyMonitoredItemsRequest.ItemsToModify[i].MonitoredItemId = itemsToModify[i].MonitoredItemId;
            this.ModifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.ClientHandle = itemsToModify[i].ClientHandle;
            this.ModifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.DiscardOldest = itemsToModify[i].DiscardOldest;
            this.ModifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.QueueSize = itemsToModify[i].QueueSize;
            this.ModifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.SamplingInterval = itemsToModify[i].SamplingInterval;
            if( itemsToModify[i].Filter !== null )
            {
                this.ModifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.Filter = itemsToModify[i].Filter;
            }
            if( suppressMessaging === undefined || suppressMessaging == false )
            {
                print( "\t\tNodeId: " + itemsToModify[i].MonitoredItemId +
                    "; ClientHandle: " + itemsToModify[i].ClientHandle +
                    "; DiscardOldest: " + itemsToModify[i].DiscardOldest +
                    "; Filter: " + itemsToModify[i].Filter +
                    "; QueueSize:" + itemsToModify[i].QueueSize +
                    "; SamplingInterval: " + itemsToModify[i].SamplingInterval );
            }
        }// for i...
        // call modify
        var result = false;
        this.uaStatus = this.SessionObject.modifyMonitoredItems( this.ModifyMonitoredItemsRequest, this.ModifyMonitoredItemsResponse );
        if( suppressMessaging === undefined || suppressMessaging == false ) print( "\tModifyMonitoredItems result: " + this.uaStatus );
        if( this.uaStatus.isGood() )
        {
            if( expectedResults == undefined || expectedResults == null )
            {
                if( suppressMessaging === undefined || suppressMessaging == false ) print( "\t... checking the response is Valid..." );
                result = checkModifyMonitoredItemsValidParameter( this.ModifyMonitoredItemsRequest, this.ModifyMonitoredItemsResponse, suppressMessaging );
            }
            else
            {
                if( errorNotFail == undefined || errorNotFail == null || errorNotFail == true )
                {
                    if( suppressMessaging === undefined || suppressMessaging == false ) print( "\t... checking the response was in Error, as expected..." );
                    result = checkModifyMonitoredItemsError( this.ModifyMonitoredItemsRequest, this.ModifyMonitoredItemsResponse, expectedResults );
                }
                else
                {
                    if( suppressMessaging === undefined || suppressMessaging == false ) print( "\t... checking the response Failed, as expected..." );
                    result = checkModifyMonitoredItemsFailed( this.ModifyMonitoredItemsRequest, this.ModifyMonitroedItemsResponse, expectedResults );
                }
            }
        }// if Good
        else
        {
            addError( "ModifyMonitoredItems() status " + this.uaStatus, this.uaStatus );
        }
        if( suppressMessaging === undefined || suppressMessaging == false ) print( "\tModifyMonitoredItems (helper) result: " + result );
        return( result );
    }
}