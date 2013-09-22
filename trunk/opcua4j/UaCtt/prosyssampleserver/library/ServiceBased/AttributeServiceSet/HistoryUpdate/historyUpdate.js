/*    This class object is responsible for calling the HistoryRead() service and for also 
      performing any validation etc. This is a quick-use class.

      See the bottom of this file for an example on using it.

    Revision History
        27-Sep-2010: Initial Version.
*/

include( "./library/ServiceBased/AttributeServiceSet/HistoryRead/check_historyRead_valid.js" );

function HistoryUpdate( session )
{
    if( arguments.length != 1 || session.SessionId == undefined )
    {
        throw( "Read() instanciation failed, argument 'session' is missing or not a Session object." );
    }
    
    this.session = session;    // session object reference
    this.request = null;       // copy of the last/current HistoryRead request header
    this.response = null;      // copy of the last/current HistoryRead server response header
    this.success  = false;     // simple flag indicating if the last/current call succeeded or not.
    
    /* Reads values.
          Parameters are: 
              monitoredItems            = an array of 'MonitoredItem' objects, to read.
              readDetails               = the HistoryReadDetails extensible parameter.
              timestampsToReturn        = TimestampsToReturn enum.
              releaseContinuationPoints = Boolean flag.
              expectedErrors            = an array of ExpectedAndAcceptedErrors objects.
              expectErrorNotFail        = true means use check_read_error, else check_read_failed. */
    this.Execute = function( monitoredItems, expectedErrors, expectErrorNotFail )
    {
        var result = true;
        if( arguments.length < 1 )
        {
            throw( "HistoryRead.Execute() arguments missing: monitoredItems, readDetails, timestampsToReturn and releaseContinuationPoints" );
        }
        if( expectedErrors !== undefined )
        {
            if( expectErrorNotFail === undefined )
            {
                addError( "Did not specify which HistoryUpdate error checking script to use (checkWriteErr param)" );
                return( false );
            }
        }
        // is the monitoredItems parameter a collection, or single item?
        if( monitoredItems.length == undefined )
        {
            if( monitoredItems.MonitoredItemId == undefined || monitoredItems.MonitoredItemId == null )
            {
                throw( "Read.Execute() argument error. MonitoredItems is not of the correct type." );
            }
            else
            {
                monitoredItems = [monitoredItems];
            }
        }

        var tstampsToReturn = timestampsToReturn == undefined ? TimestampsToReturn.Both : timestampsToReturn;

        // define the historyRead headers
        this.request  = new UaHistoryUpdateRequest();
        this.response = new UaHistoryUpdateResponse();
        this.session.buildRequestHeader( this.request.RequestHeader );

        // specify the items and values to write
        addLog( "Reading history for '" + monitoredItems.length + "' items: " );
        var message = "";
        for( var m=0; m<monitoredItems.length; m++ )
        {
            throw( "TODO: populate the 'HistoryUpdateDetails' collection." );
            addLog( message );
        }// for m...

        // issue the write
        var uaStatus = this.session.historyUpdate( this.request, this.response );
        this.readSuccess = uaStatus.isGood();
        if( uaStatus.isGood() )
        {
            if( expectErrorNotFail === undefined )
            {
                result = checkHistoryUpdateValidParameter( this.readRequest, this.readResponse, monitoredItems );
            }
            else
            {
                if( expectErrorNotFail )
                {
                    result = checkHistoryUpdateError( this.readRequest, this.readResponse, expectedErrors, monitoredItems );
                }
                else
                {
                    result = checkHistoryUpdateFailed( this.readRequest, this.readResponse, expectedErrors );
                }
            }
            this.setMonitoredItemHistoryValues( monitoredItems );
        }
        else
        {
            addError( "HistoryRead() status " + uaStatus, uaStatus );
            result = false;
        }

        // now to update our monitoredItems with the results of the update!
        throw( "TODO: Update MI's with update result!" );
        return( result );
    };//Read

}