include( "./library/ServiceBased/MonitoredItemServiceSet/SetTriggering/check_setTriggering_valid.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/SetTriggering/check_setTriggering_error.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/SetTriggering/check_setTriggering_failed.js" );

/*    This class object is responsible for calling the SetTriggering() service and for also
      performing any validation etc. This is a quick-use class.

      See the bottom of this file for an example on using it.

    Revision History
        21-Oct-2009 NP: Initial Version
*/
function SetTriggering( sessionObject )
{
    if( arguments.length !== 1 )
    {
        throw( "SetTriggering() class requires the 'session' (sessionObject) parameter." );
    }

    // call specific properties
    this.session = sessionObject;
    this.SetTriggeringRequest = new UaSetTriggeringRequest();
    this.SetTriggeringResponse = new UaSetTriggeringResponse();
    this.uaStatus = null;

    /*  Invokes the call to SetTriggering()
        Parameters: 
            subscription         (required) - The subscription (Subscription object)
            triggerItem          (requred)  - A MonitoredItem for the TRIGGER
            linksToAdd           (optional) - Array of MonitoredItems for LINKSTOADD
            linksToDelete        (optional) - Array of MonitoredItems for LINKSTODELETE
            expectedErrorNotFail (optional) - True=expect Errors; FALSE=expect FAIL
            expectedErrorsAdd    (optional) - An array of ExpectedAndAcceptedResults
            expectedErrorsDelete (optional) - An array of ExpectedAndAcceptedResults
            
            NOTE: If expectedErrorNotFail = FALSE, then expectedErrorsAdd is used as the SERVICE expected result (not operation).
    */
    this.Execute = function( subscription, triggerItem, linksToAdd, linksToDelete, expectErrorNotFail, expectedErrorsAdd, expectedErrorsDelete )
    {
        var linksToAddArray;
        var linksToDeleteArray;
        if( true ) // parameter checking....
        {
            if( arguments.length < 3 )
            {
                throw( "SetTriggering().Execute() arguments missing: subscription, triggerItem and a linksToAdd/Delete also" );
            }
            if( subscription.SubscriptionId === undefined ) throw( "Invalid subscription object, it must be a Subscription object." );
            if( triggerItem.MonitoredItemId === undefined ) throw( "Invalid triggerItem object, it must be a MonitoredItem object." );
            // continue parameter checking.... linksToAdd
            // expectedErrorsAdd is OPTIONAL, so we can let this slide unless 'expectErrorNotFailAdd' is present
            if( expectErrorNotFail !== undefined && expectErrorNotFail !== null )
            {
                if( linksToAdd !== undefined && linksToAdd !== null )
                {
                    if( linksToAdd.length !== undefined ) linksToAddArray = linksToAdd;
                    else if( linksToAdd.MonitoredItemId !== undefined ) linksToAddArray = [linksToAdd];
                    else if( "linksToAdd is NOT a collection of MonitoredItem objects." );
                    if( linksToAddArray.length > 0 && expectedErrorsAdd == undefined )       throw( "Arguments missing: LinksToAdd specified, but not ExpectedErrorsAdd" );
                }
                // continue parameter checking.... linksToDelete
                if( linksToDelete !== undefined && linksToDelete !== null )
                {
                    if( linksToDelete.length !== undefined ) linksToDeleteArray = linksToDelete;
                    else if( linksToDelete.MonitoredItemId !== undefined ) linksToDeleteArray = [linksToDelete];
                    else throw( "linksToDelete is NOT a collection of MonitoredItem objects." );
                    if( linksToDeleteArray.length > 0 && expectedErrorsDelete == undefined ) throw( "Arguments missing: LinksToDelete specified, but not ExpectedErrorsDelete" );
                }
            }
            else
            {
                if( linksToAdd !== undefined && linksToAdd.length === undefined )
                {
                    linksToAddArray = [ linksToAdd ];
                }
                else
                {
                    linksToAddArray = linksToAdd;
                }
                if( linksToDelete !== undefined && linksToDelete.length === undefined )
                {
                    linksToDeleteArray = [ linksToDelete ];
                }
                else
                {
                    linksToDeleteArray = linksToDelete;
                }
            }
        }

        var result = true;// return parameter, i.e. TRUE = Successfully executed.

        // built the SetTriggeringRequest request...
        this.SetTriggeringRequest = new UaSetTriggeringRequest();
        this.SetTriggeringResponse = new UaSetTriggeringResponse();
        this.session.buildRequestHeader( this.SetTriggeringRequest.RequestHeader );

        this.SetTriggeringRequest.SubscriptionId   = subscription.SubscriptionId;
        this.SetTriggeringRequest.TriggeringItemId = triggerItem.MonitoredItemId;

        // now to add any LinksToAdd
        var addMessage = "SetTriggering: \n\tAdding:";
        if( linksToAddArray !== undefined )
        {
            for( var a=0; a<linksToAddArray.length; a++ ) // 'a' for Add 
            {
                this.SetTriggeringRequest.LinksToAdd[a] = linksToAddArray[a].MonitoredItemId;
                addMessage += "\n\t\t" + this.SetTriggeringRequest.LinksToAdd[a];
            }// for a...
        }

        // now to add any LinksToDelete
        addMessage += "\n\tDeleting:";
        if( linksToDeleteArray !== undefined )
        {
            for( var a=0; a<linksToDeleteArray.length; a++ ) // 'a' for Add 
            {
                this.SetTriggeringRequest.LinksToRemove[a] = linksToDeleteArray[a].MonitoredItemId;
                addMessage += "\n\t\t" + this.SetTriggeringRequest.LinksToRemove[a];
            }// for a...
        }

        addLog( addMessage );
        this.uaStatus = this.session.setTriggering( this.SetTriggeringRequest, this.SetTriggeringResponse );
        print( "\tSetTriggering called... now to check results..." );
        if( this.uaStatus.isGood() )
        {
            // do we expect this to succeed or fail? check the optional parameters
            if( expectErrorNotFail == undefined )
            {
                result = checkSetTriggeringValidParameter( this.SetTriggeringRequest, this.SetTriggeringResponse );
            }
            else
            {
                // an error, or a fail?
                if( expectErrorNotFail )
                {
                    result = checkSetTriggeringError( this.SetTriggeringRequest, this.SetTriggeringResponse, expectedErrorsAdd, expectedErrorsDelete );
                }
                else
                {
                    result = checkSetTriggeringFailed( this.SetTriggeringRequest, this.SetTriggeringResponse, expectedErrorsAdd );
                }
            }// else... if( expectedErrors == undefined )
        }
        else
        {
            addError( "SetMonitoringMode() status " + this.uaStatus, this.uaStatus );
            addError( this.uaStatus.toString() );
            result = false;
        }// else... if( uaStatus.isGood() )
        return( result );
    }// Execute()
}