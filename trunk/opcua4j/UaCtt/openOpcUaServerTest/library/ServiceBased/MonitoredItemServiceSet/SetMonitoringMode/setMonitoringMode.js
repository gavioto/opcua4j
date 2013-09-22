include( "./library/ServiceBased/MonitoredItemServiceSet/SetMonitoringMode/check_setMonitoringMode_error.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/SetMonitoringMode/check_setMonitoringMode_failed.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/SetMonitoringMode/check_setMonitoringMode_valid.js" );

/*  This object is responsible for calling and processing calls to the SetMonitoringMode() Service.

    Revision History:
        20-Oct-2009 NP: Initial version

    Object definition
        Properties:
            session                       - a reference to the Session object.
            setMonitoringModeRequest
            setMonitoringModeResponse

        Methods:
            Execute                             - invokes the call to Publish().
*/

function SetMonitoringMode( sessionObject )
{
    if( arguments.length !== 1 )
    {
        throw( "Invalid argument count. A session object is required. 'SetMonitoringMode()' class object instanciation." );
    }
    else
    {
        this.session = sessionObject;
    }

    // objects used by this class
    this.setMonitoringModeRequest = new UaSetMonitoringModeRequest();;
    this.setMonitoringModeResponse = new UaSetMonitoringModeResponse();
    this.uaStatus = null;

    /* invokes the SetMonitoringMode() call.
           Parameters:
               monitoringMode       - 'monitoringMode' enumerator.
               monitoredItems       - array of 'monitoredItem' objects.
               subscription         - 'subscription' object.
    */
    this.Execute = function( monitoringMode, monitoredItems, subscription, expectedErrors, expectErrorNotFail )
    {
        print( "\n\nSetMonitoringMode()" );

        if( arguments.length < 3 )
        {
            throw( "Invalid argument count. Requires 'monitoringMode', 'monitoredItems', 'subscription'" );
        }
        if( subscription.SubscriptionId === undefined )
        {
            throw( "Invalid argument. 'subscription' is not of type 'Subscription'" );
        }

        this.session.buildRequestHeader( this.setMonitoringModeRequest.RequestHeader );
        print( "\tMonitoringMode = " + monitoringMode );
        this.setMonitoringModeRequest.MonitoringMode = monitoringMode;
        this.setMonitoringModeRequest.SubscriptionId = subscription.SubscriptionId;
        print( "\tSubscriptionId = " + subscription.SubscriptionId );
        
        // now to cycle thru the monitoredItems so we can specify them in our request
        if( monitoredItems.length === undefined )
            monitoredItems = [monitoredItems]; // turn the parameter into an array (and self-populate)
        for( var m=0; m<monitoredItems.length; m++ ) // 'm' for MonitoredItem 
        {
            this.setMonitoringModeRequest.MonitoredItemIds[m] = monitoredItems[m].MonitoredItemId;
            print( "\t\tMonitoredItem: " + monitoredItems[m].MonitoredItemId );
        }

        var result; // function return
        
        // now to invoke the call
        this.uaStatus = this.session.setMonitoringMode( this.setMonitoringModeRequest, this.setMonitoringModeResponse );
        if( this.uaStatus.isGood() )
        {
            if( expectErrorNotFail === undefined )
            {
                result = checkSetMonitoringModeValidParameter( this.setMonitoringModeRequest, this.setMonitoringModeResponse );
            }
            else
            {
                if( expectErrorNotFail )
                {
                    result = checkSetMonitoringModeError( this.setMonitoringModeRequest, this.setMonitoringModeResponse, expectedErrors );
                }
                else
                {
                    result = checkSetMonitoringModeFailed( this.setMonitoringModeRequest, this.setMonitoringModeResponse, expectedErrors );
                }
            }
        }
        else
        {
            addError( "SetMonitoringMode() status " + this.uaStatus, this.uaStatus );
            result = false;
        }

        return( result );
    }
}