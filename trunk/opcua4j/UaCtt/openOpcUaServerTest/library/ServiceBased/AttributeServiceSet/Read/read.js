include( "./library/ServiceBased/AttributeServiceSet/Read/check_read_valid.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/check_read_error.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/check_read_failed.js" );

/*    This class object is responsible for calling the Read() service and for also
      performing any validation etc. This is a quick-use class.

      See the bottom of this file for an example on using it.

    Revision History
        16-Oct-2009 NP: Initial Version
        17-Apr-2010 DP: Fixed Execute to use the compliance group's MaxAge default instead of the CTT's default.
*/
function Read( session )
{
    if( arguments.length != 1 || session.SessionId == undefined )
    {
        throw( "Read() instanciation failed, argument 'session' is missing or not a Session object." );
    }
    
    this.session = session;
    this.readRequest = null;
    this.readResponse = null;
    this.readSuccess = false;
    this.settingNames = [];
    this.uaStatus = null;
    
    /* Reads values.
          Parameters are: 
              monitoredItems     = an array of 'MonitoredItem' objects, to read.
              timestampsToReturn = TimestampsToReturn enum.
              maxAge             = maxAge value.
              expectedErrors     = an array of ExpectedAndAcceptedErrors objects.
              expectErrorNotFail = true means use check_read_error, else check_read_failed. */
    this.Execute = function( monitoredItems, timestampsToReturn, maxAge, expectedErrors, expectErrorNotFail, suppressMessaging )
    {
        var result = true;
        if( arguments.length < 1 )
        {
            throw( "Read.Execute() arguments missing: 'monitoredItems'" );
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
        var maxAgeToUse     = ( maxAge === undefined || maxAge ===  null ) ? 10000 : maxAge;

        // define the write headers
        this.readRequest  = new UaReadRequest();
        this.readResponse = new UaReadResponse();
        this.session.buildRequestHeader( this.readRequest.RequestHeader );

        if( tstampsToReturn != undefined ) { this.readRequest.TimestampsToReturn = tstampsToReturn; }
        if( maxAgeToUse     != undefined ) { this.readRequest.MaxAge = maxAgeToUse; }

        // specify the items and values to write
        if( suppressMessaging === undefined || suppressMessaging === false ) addLog( "Reading '" + monitoredItems.length + "' items." );
        var message = "";
        var m;
        for( m=0; m<monitoredItems.length; m++ )
        {
            this.readRequest.NodesToRead[m].NodeId      = monitoredItems[m].NodeId;
            this.readRequest.NodesToRead[m].AttributeId = monitoredItems[m].AttributeId;
            this.readRequest.NodesToRead[m].IndexRange  = monitoredItems[m].IndexRange;
            message = "\t[" + m + "] NodeId: '" + monitoredItems[m].NodeId + "'; Attribute: '" + Attribute.toString( monitoredItems[m].AttributeId ) + "'; IndexRange: '" + monitoredItems[m].IndexRange + "'";
            if( monitoredItems[m].NodeSetting !== null && monitoredItems[m].NodeSetting.length > 0 )
            {
                message += " (setting: '" + monitoredItems[m].NodeSetting + "')";
            }
            if( suppressMessaging === undefined || suppressMessaging === false ) print( message );
        }// for m...

        // issue the write
        this.uaStatus = this.session.read( this.readRequest, this.readResponse );

        // check result
        this.readSuccess = this.uaStatus.isGood();
        if( this.uaStatus.isGood() )
        {
            this.settingNames = MonitoredItem.GetSettingNames( monitoredItems );
            if( expectErrorNotFail === undefined )
            {
                result = checkReadValidParameter( this.readRequest, this.readResponse, this.settingNames, suppressMessaging );
            }
            else
            {
                if( expectErrorNotFail )
                {
                    result = checkReadError( this.readRequest, this.readResponse, expectedErrors, this.settingNames );
                }
                else
                {
                    result = checkReadFailed( this.readRequest, this.readResponse, expectedErrors );
                }
            }
            this.setMonitoredItemValues( monitoredItems );
        }
        else
        {
            addError( "Read() status " + this.uaStatus, this.uaStatus );
            result = false;
        }
        return( result );
    };//Read

    this.setMonitoredItemValues = function( monitoredItems )
    {
        if( this.readResponse !== undefined && this.readRequest !== undefined )
        {
            if( monitoredItems.length == undefined )
            {
                monitoredItems = [ monitoredItems ];
            }
            var r;
            for( r=0; r<this.readResponse.Results.length; r++ ) // 'r' for Results
            {
                // now to pair-up the monitoredItems in our this.monitoredItems
                // property, with the Item requested in the ReadRequest.
                if( this.readResponse.Results[r].StatusCode.isGood() )
                {
                    // all results should be in the order of the items
                    var currentDataValue = this.readResponse.Results[r];
                    monitoredItems[r].Value = currentDataValue;
                    if( currentDataValue !== null )
                    {
                        monitoredItems[r].DataType = currentDataValue.Value.DataType;

                        // we'll also set some other properties too
                        monitoredItems[r].ArrayUpperBound = currentDataValue.Value.getArraySize();
                        monitoredItems[r].IsArray = monitoredItems[r].ArrayUpperBound != -1;
                    }
                }// isGood()?
            }// for r...
            return( true );
        }
        return( false );
    };//SetMonitoredItemValues

    // prints the values received in the last Read call.
    // Optional parameters:
    //   - MaxStringSize - Applies to the VALUE attribute. If the string value exceeds this
    //                     length, then the string is truncated with an obvious message.
    this.ValuesToString = function( MaxStringSize )
    {
        var values = "";
        if( this.readResponse !== undefined && this.readRequest !== undefined )
        {
            var r;
            for( r=0; r<this.readResponse.Results.length; r++ ) // 'r' for Results
            {
                var valueAsString = this.readResponse.Results[r].Value.toString();
                if( MaxStringSize !== undefined )
                {
                    if( valueAsString.length > MaxStringSize )
                    {
                        valueAsString = valueAsString.substring( 0, MaxStringSize ) + "... (truncated by script)";
                    }
                }
                // if not an array
                values = "NodeId: " + this.readRequest.NodesToRead[r].NodeId;
                if( this.settingNames !== null && this.settingNames.length == this.readRequest.NodesToRead.length )
                {
                    values += "; (Setting: '" + this.settingNames[r] + "') ";
                }
                values += "; Value: '" + valueAsString + "'" +
                    "; Quality: "  +  this.readResponse.Results[r].StatusCode;
                
                // check which timestamp(s) to display
                if( this.readRequest.TimestampsToReturn == TimestampsToReturn.Server || this.readRequest.TimestampsToReturn == TimestampsToReturn.Both )
                {
                    values += "; Time Server: " + this.readResponse.Results[r].ServerTimestamp;
                }
                if( this.readRequest.TimestampsToReturn == TimestampsToReturn.Source || this.readRequest.TimestampsToReturn == TimestampsToReturn.Both )
                {
                    values += "; Time Source: " + this.readResponse.Results[r].SourceTimestamp;
                }
            }// for r...
        }
        return( values );
    };
}