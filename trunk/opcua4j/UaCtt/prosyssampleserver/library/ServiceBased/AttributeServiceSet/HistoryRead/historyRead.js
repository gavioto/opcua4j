/*    This class object is responsible for calling the HistoryRead() service and for also 
      performing any validation etc. This is a quick-use class.

      See the bottom of this file for an example on using it.

    Revision History
        27-Sep-2010: Initial Version.
*/

include( "./library/ServiceBased/AttributeServiceSet/HistoryRead/check_historyRead_valid.js" );

function HistoryRead( session )
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
    this.Execute = function( monitoredItems, readDetails, timestampsToReturn, releaseContinuationPoints, expectedErrors, expectErrorNotFail )
    {
        var result = true;
        if( arguments.length < 4 )
        {
            throw( "HistoryRead.Execute() arguments missing: monitoredItems, readDetails, timestampsToReturn and releaseContinuationPoints" );
        }
        if( expectedErrors !== undefined )
        {
            if( expectErrorNotFail === undefined )
            {
                addError( "Did not specify which Write error checking script to use (checkWriteErr param)" );
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
        this.request  = new UaHistoryReadRequest();
        this.response = new UaHistoryReadResponse();
        this.session.buildRequestHeader( this.request.RequestHeader );

        if( tstampsToReturn !== undefined ) { this.request.TimestampsToReturn = tstampsToReturn; }

        // specify the items and values to write
        addLog( "Reading history for '" + monitoredItems.length + "' items: " );
        var message = "";
        for( var m=0; m<monitoredItems.length; m++ )
        {
            this.request.NodesToRead[m].NodeId       = monitoredItems[m].NodeId;
            this.request.NodesToRead[m].DataEncoding = monitoredItems[m].DataEncoding;
            this.request.NodesToRead[m].IndexRange   = monitoredItems[m].IndexRange;
            this.request.NodesToRead[m].ContinuationPoint = monitoredItems[m].ContinuationPoint;
            message = "\tNodeId: '" + monitoredItems[m].NodeId + "';  IndexRange: '" + monitoredItems[m].IndexRange + 
                "'; DataEncoding: '" + monitoredItems[m].DataEncoding + "'; ContinuationPoint: '" + monitoredItems[m].ContinuationPoint + "'";
            if( monitoredItems[m].NodeSetting !== null && monitoredItems[m].NodeSetting.length > 0 )
            {
                message += " (setting: '" + monitoredItems[m].NodeSetting + "')";
            }
            addLog( message );
        }// for m...

        // issue the write
        var uaStatus = this.session.historyRead( this.request, this.response );

        // check result
        this.readSuccess = uaStatus.isGood();
        if( uaStatus.isGood() )
        {
            if( expectErrorNotFail === undefined )
            {
                result = checkHistoryReadValidParameter( this.readRequest, this.readResponse, monitoredItems );
            }
            else
            {
                if( expectErrorNotFail )
                {
                    result = checkHistoryReadError( this.readRequest, this.readResponse, expectedErrors, monitoredItems );
                }
                else
                {
                    result = checkHistoryReadFailed( this.readRequest, this.readResponse, expectedErrors );
                }
            }
            this.setMonitoredItemHistoryValues( monitoredItems );
        }
        else
        {
            addError( "HistoryRead() status " + uaStatus, uaStatus );
            result = false;
        }

        // now to update our monitoredItems with the values just Read...
        // but first, we need to cast the "HistoryData" to the appropriate type!
        if( this.response.HistoryData === null )
        {
            addError( "HistoryRead returned HistoryData=<null>" );
        }
        else
        {
            var historyDataConverted = null;
            // try "HistoryData" first
            historyDataConverted = this.response.HistoryData.toHistoryData();
            if( historyDataConverted === null )
            {
                // now try "ReadRawModified"
                historyDataConverted = this.response.HistoryData.toReadRawModifiedDetails();
            }
            if( historyDataConverted == null )
            {
                addError( "Unable to cast the history object receive (response.HistoryData) to any expected type." );
            }
            else
            {
                // TODO: update MI's with values read from history.
                //for( var m=0;
            }
        }
        return( result );
    };//Read

}