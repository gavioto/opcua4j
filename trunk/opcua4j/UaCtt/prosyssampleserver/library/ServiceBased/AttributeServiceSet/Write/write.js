include( "./library/ServiceBased/AttributeServiceSet/Write/check_write_valid.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/check_write_error.js" );

/*    This class object is responsible for calling the Write() service and for also
      performing any validation etc. This is a quick-use class.

      See the bottom of this file for an example on using it.

    Revision History
        16-Oct-2009 NP: Initial Version
*/
function Write( session )
{
    if( arguments.length === 1 )
    {
        this.session = session;
    }
    
    this.writeRequest = null;
    this.writeResponse = null;
    this.writeSuccess = false;
    this.uaStatus = null;
    this.writeCalls = 0;
    
    /* Writes values.
          Parameters are: 
              expectedErrors = an array of ExpectedAndAcceptedErrors objects
              checkWriteErr  = true means use check_write_error, else check_write_failed
              checkNotSupported = True = exit gracefully if we expect functionality is not supported
              readVerification  = True = do READ the values back to verify the writes; defaults to false */
    this.Execute = function( monitoredItems, expectedErrors, checkWriteErr, checkNotSupported, readVerification, suppressMessaging )
    {
        var m, i;
        
        if( arguments.length < 1 )
        {
            throw( "Write().Execute() requires 1 argument by minimum: 'monitoredItems'" );
        }
        if( expectedErrors !== undefined )
        {
            if( checkWriteErr === undefined )
            {
                addError( "Did not specify which Write error checking script to use (checkWriteErr param)" );
                return( false );
            }
        }

        // define the write headers
        this.writeRequest  = new UaWriteRequest();
        this.writeResponse = new UaWriteResponse();
        this.session.buildRequestHeader( this.writeRequest.RequestHeader );

        // specify the items and values to write
        if( monitoredItems.length == undefined )
        {
            if( monitoredItems.MonitoredItemId !== undefined )
            {
                monitoredItems = [ monitoredItems ];
            }
        }
        if( suppressMessaging === undefined || suppressMessaging === false ) addLog( "Write #" + this.writeCalls + ". Writing to " + monitoredItems.length + " items..." );
        for( m=0; m<monitoredItems.length; m++ )
        {
            this.writeRequest.NodesToWrite[m].NodeId      = monitoredItems[m].NodeId;
            this.writeRequest.NodesToWrite[m].AttributeId = monitoredItems[m].AttributeId;
            this.writeRequest.NodesToWrite[m].IndexRange  = monitoredItems[m].IndexRange;
            this.writeRequest.NodesToWrite[m].Value.Value = monitoredItems[m].Value.Value;
            var logMessage = "\t" + ( m ) +
                ") Node: '" + this.writeRequest.NodesToWrite[m].NodeId + 
                "'; (setting: '" + monitoredItems[m].NodeSetting + "')" +
                " Value: '" + this.writeRequest.NodesToWrite[m].Value.Value +
                "'; IndexRange: '" + this.writeRequest.NodesToWrite[m].IndexRange + "'";
            if( monitoredItems[m].Value.StatusCode.StatusCode !== -1 )
            {
                this.writeRequest.NodesToWrite[m].Value.StatusCode = monitoredItems[m].Value.StatusCode;
                logMessage += "; StatusCode: '" + this.writeRequest.NodesToWrite[m].Value.StatusCode + "'";
            }
            if( monitoredItems[m].Value.TimestampServer !== undefined && monitoredItems[m].Value.TimestampServer.msecsTo( new UaDateTime() ) > 0 )
            {
                this.writeRequest.NodesToWrite[m].Value.ServerTimestamp = monitoredItems[m].Value.ServerTimestamp;
                logMessage += "; ServerTimestamp: '" + this.writeRequest.NodesToWrite[m].Value.ServerTimestamp + "'";
            }
            if( monitoredItems[m].Value.TimestampServer !== undefined && monitoredItems[m].Value.TimestampSource.msecsTo( new UaDateTime() ) > 0 )
            {
                this.writeRequest.NodesToWrite[m].Value.SourceTimestamp = monitoredItems[m].Value.SourceTimestamp;
                logMessage += "; SourceTimestamp: '" + this.writeRequest.NodesToWrite[m].Value.SourceTimestamp + "'";
            }
            if( suppressMessaging === undefined || suppressMessaging === false ) addLog( logMessage );
        }// for m...

        // issue the write
        this.uaStatus = this.session.write( this.writeRequest, this.writeResponse );

        // increment the write call counter
        this.writeCalls++;

        // check result
        if( suppressMessaging === undefined || suppressMessaging === false ) print( "Write complete. Checking results..." );
        if( this.uaStatus.isGood() )
        {
            // will we be validating the Writes occurred by Reading them back?
            if( readVerification !== undefined && readVerification !== null )
            {
                if( suppressMessaging === undefined || suppressMessaging === false ) print( "\t*** Write verification is: " + ( readVerification == true? "Enabled" : "Disabled" ) + " ***" );
            }
            else
            {
                readVerification = false;
            }

            var settingNames = MonitoredItem.GetSettingNames( monitoredItems );
            if( expectedErrors === undefined )
            {
                this.writeSuccess = ( checkWriteValidParameter( this.writeRequest, this.writeResponse, readVerification, settingNames, undefined, suppressMessaging ) );
            }
            else
            {
                if( checkWriteErr )
                {
                    this.writeSuccess = ( checkWriteError( this.writeRequest, this.writeResponse, expectedErrors, readVerification, settingNames, checkNotSupported ) );
                }
                else
                {
                    this.writeSuccess = ( checkWriteFailed( this.writeRequest, this.writeResponse, expectedErrors ) );
                }
            }

            // print the results
            if( suppressMessaging === undefined || suppressMessaging === false ) 
            {
                print( "Headers checked. Write complete. Results are:" );
                for( i=0; i<this.writeResponse.Results.length; i++ )
                {
                    print( "\t" + i + ".) " + this.writeResponse.Results[i] );
                }// for i
            }
        }
        else
        {
            addError( "Write() status " + this.uaStatus, this.uaStatus );
            this.writeSuccess = false;
        }
        return( this.writeSuccess );
    };
}


/* example using this class:

    // get an array of monitoredItems from the settings
    var monitoredItems = MonitoredItem.fromNodeIds( NodeIdSettings.GetArrayStaticNodeIds(), Attribute.Value, "2:4", MonitoringMode.Reporting, true, null, 10, 1000 );

    // define an instance of the class, specifying an array of MonitorItem objects, and 
    // a session
    var w = new Write( monitoredItems, g_session );
    if( w.Write() )
        addLog( "success" );
    else
        addError( "FAILED" );
*/