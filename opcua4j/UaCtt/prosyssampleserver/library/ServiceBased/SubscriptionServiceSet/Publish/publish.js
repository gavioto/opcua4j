include( "./library/ServiceBased/SubscriptionServiceSet/Publish/check_publish_valid.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/check_publish_error.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/check_publish_failed.js" );

/*  This object is responsible for calling and processing notification data in the Publish() Service.

    Revision History:
        15-Oct-2009 NP: Initial version.
        07-Feb-2011 NP: Acknowledging of SEQ NOs now takes into account that server may have Purged notifications from 
                        its buffers particularly if the Client has not been acknowledging SEQ NOs as it should be.
        25-Jul-2011 NP: Added logic to check the timestamp of DataChange notifications that were purged from the Servers 
                        queue. Server NOT ALLOWED to purge items before a minimum of 1 KeepAlive interval.
        26-Jul-2011 NP: Added hooks to allow an external script to manipulate the Publish request JUST BEFORE the Publish call is made.

    Object definition
        Properties:
            publishRequest                - intended for internal use only. The publishRequest header object.
            publishResponse               - intended for internal use only. The publishResponse header object.
            session                       - a reference to the Session object.
            SubscriptionIds               - collection of SubscriptionIds to acknowledge.
            ReceivedSequenceNumbers       - collection of sequenceNumbers received
            AcknowledgedSequenceNumbers   - collection of sequenceNumbers confirmed as acknowledged
            UnAcknowledgedSequenceNumbers - collection of unacknowledged sequenceNumbers.
            ReceivedDataChanges           - collection of ALL dataChanges received.
            CurrentDataChanges            - collection of DataChanges just received.
            ReceivedEvents                - collection of ALL Events received.
            CurrentEvents                 - collection of Events just received.
            ReceivedStatusChanges         - collection of ALL statusChanges received.
            CurrentStatusChanges          - collection of StatusChanges just received.
            HookBeforeCall                - a reference to an external function to invoke, just before making the Publish call. Remember to clear when done!

        Methods:
            CurrentlyContainsData               - returns True/False suggesting Publish() yielded data to process!
            Execute                             - invokes the call to Publish().
            PrintDataChanges                    - simply 'prints' the current DataChanges information.
            PrintEvents                         - simply 'prints' the current Event information.
            SetMonitoredItemTypesFromDataChange - sets the DataTypes for the moniotoredItems based on dataChanges received.
            SetItemValuesFromDataChange         - updates specified items with values in current DataChange event.
            Clear                               - resets all of the properties, particularly the arrays.
            ClearServerNotifications            - attempts to clear out all pending notifications from a server
            HandleIsInCurrentDataChanges        - queries the current dataChange for a specified clientHandle
            HandleIsInReceivedDataChanges       - queries the received dataChanges for a specified clientHandle
            PendingAcknowledgmentsForSubscription - how many SequenceNumbers are pending ACK for a specified Subscription.
            RegisterSubscription                  - registers a subscription (object) with the Publish service.
            UnregisterSubscription                - removes a previously registered subscription with the Publish service.*/
function Publish( sessionObject, timeoutHint )
{
    if( arguments.length < 1 )
    {
        throw( "Invalid argument count. A session object is required. 'Publish()' class object instanciation." );
    }
    
    // objects used by this class
    this.publishRequest = null;
    this.publishResponse = null;
    this.uaStatus = null;
    
    // settings (for Publish call )
    var defaultTimeoutHintSettingValue = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ).toString(), 10 );
    this.TimeoutHint = parseInt( defaultTimeoutHintSettingValue, 10 );

    // sequence number and subscriptionId to acknowledge in the NEXT call to Publish
    this.SubscriptionIds = [];

    // history of sequence numbers
    this.AvailableSequenceNumbers = null;
    this.ReceivedSequenceNumbers = [];
    this.AcknowledgedSequenceNumbers = [];
    this.UnAcknowledgedSequenceNumbers = [];
    this.UnAcknowledgedSequenceTimestamps = [];

    // access to the DATACHANGES that have been received.
    this.ReceivedDataChanges = []; // intended to store ALL dataChanges received.
    this.CurrentDataChanges  = []; // intended to store ONLY the dataChanges just received.
    this.ReceivedStatusChanges = []; // intended to store ALL statusChanges received.

    // access to the EVENTS that have been received
    this.ReceivedEvents = [];      // intended to store ALL events received.
    this.CurrentEvents  = [];      // intended to store ONLY the events just received

    // relationship of Subscriptions associated with this session
    this.Subscriptions = [];

    // a reference to an external function to invoke just before calling Publish.

    this.HookBeforeCall;

    this.CallCount = 0;    // the number of times Publish has been called

    if( arguments.length >= 1 )
    {
        // sessionObject parameter
        if( sessionObject === undefined || sessionObject === null )
        {
            throw( "ERROR: SessionObject is <null>" );
        }
        this.session = sessionObject;
        // timeoutHint parameter
        if( timeoutHint !== undefined && timeoutHint !== null )
        {
            this.TimeoutHint = timeoutHint;
        }
    }

    this.CurrentlyContainsData = function()
    {
        var isData = ( this.CurrentDataChanges.length > 0 && this.CurrentDataChanges[0].MonitoredItems.length > 0 )
            || this.CurrentEvents.length > 0;
        return( isData );
    };


    /*  invokes the Publish call
        Parameters:
            noAcks   (optional ) - TRUE = Do not send any acknowledgements; FALSE = send acks. */
    this.Execute = function( noAcks, expectedErrors, expectErrorNotFail )
    {
        this.CallCount++;
        print( "Publish() called " + this.CallCount + " times now. TimeoutHint: " + this.TimeoutHint );
        var success = true;
        var r, d;

        // Build the request/response header objects
        this.publishRequest = new UaPublishRequest();
        this.publishResponse = new UaPublishResponse();
        this.session.buildRequestHeader( this.publishRequest.RequestHeader );

        // override the TimeoutHint (requestHeader)
        this.publishRequest.RequestHeader.TimeoutHint = this.TimeoutHint;

        // do we need to acknowledge anything? if so, then add them now...
        if( this.UnAcknowledgedSequenceNumbers.length > 0 && this.SubscriptionIds.length > 0 )
        {
            if( noAcks )
            {
                print( "\tIgnoring subscription acknowledgements..." );
            }
            else
            {

                print( "\tBuilding Publish() request: " + this.UnAcknowledgedSequenceNumbers.length + " SequenceNumber acknowledgements." );
                var a=0;
                while( this.UnAcknowledgedSequenceNumbers.length !== 0 )
                {
                    // insert the subscription id, and then remove it from its collection
                    this.publishRequest.SubscriptionAcknowledgements[a].SubscriptionId  = this.SubscriptionIds.shift();
    
                    // insert the sequenceNumber, and remove it from its collection
                    this.publishRequest.SubscriptionAcknowledgements[a].SequenceNumber = this.UnAcknowledgedSequenceNumbers.shift();

                    // display the subscription and sequenceNumber in the Script Output dialog
                    print( "\t\tSubscription Id [" + a + "] = " + this.publishRequest.SubscriptionAcknowledgements[a].SubscriptionId + "; Sequence number [" + a + "] = " + this.publishRequest.SubscriptionAcknowledgements[a].SequenceNumber );
                    // increment "a"
                    a++;
                }//while
            }
        }
        else
        {
            print( "\tNothing to acknowledge in this Publish() call." );
        }

        // before we call publish, clear the contents of CurrentDataChanges and 
        // currentEvents
        this.CurrentDataChanges = [];
        this.CurrentEvents = [];
        this.CurrentStatusChanges = [];

        // check if we need to invoke a "hook" method...
        if( this.HookBeforeCall !== undefined && this.HookBeforeCall !== null )
        {
            addLog( "Publish() invoking hook script: " + this.HookBeforeCall.name + "..." );
            this.HookBeforeCall();
            addLog( "Publish() hook script invocation complete, calling Publish()" );
        }

        // call Publish
        var publishCallDT = UaDateTime.utcNow();
        print( "\tPublish called: " + publishCallDT );
        this.uaStatus = this.session.publish( this.publishRequest, this.publishResponse );
        var publishReturnDT = UaDateTime.utcNow();
        print( "\tPublish return: " + publishReturnDT );
        if( this.uaStatus.isGood() )
        {
            // store the availableSequenceNumbers parameter
            this.AvailableSequenceNumbers = this.publishResponse.AvailableSequenceNumbers;
            if( expectedErrors === undefined )
            {
                if( checkPublishValidParameter( this.publishRequest, this.publishResponse ) )
                {
                    // check the Results parameter, because this will tell us if our previous acknowledgements 
                    // were accepted/ignored etc.
                    for( r=0; r<this.publishResponse.Results.length; r++ )// 'r' for Results 
                    {
                        if( this.publishResponse.Results[r].isGood() )
                        {
                            var sequenceNoAckd = this.publishRequest.SubscriptionAcknowledgements[r].SequenceNumber;
                            this.UnAcknowledgedSequenceNumbers.shift();
                            this.UnAcknowledgedSequenceTimestamps.shift();
                            this.AcknowledgedSequenceNumbers.push( sequenceNoAckd );
                        }
                    }// for r...

                    // have we received any data? if not then this is a keep-alive!
                    print( "\tReceived " + this.publishResponse.NotificationMessage.NotificationData.size + " notifications in the Publish response." );
                    if( this.publishResponse.NotificationMessage.NotificationData.size > 0 )
                    {
                        // capture the DataChanges & Events etc.
                        for( d=0; d<this.publishResponse.NotificationMessage.NotificationData.size; d++ ) // 'd' for DataChange
                        {

                            // DATA CHANGE HANDLING
                            var dataChangeEvent = this.publishResponse.NotificationMessage.NotificationData[d].toDataChangeNotification();
                            if( dataChangeEvent !== undefined && dataChangeEvent !== null )
                            {
                                // store the subscriptionId, so we can ACK it later!
                                this.SubscriptionIds.push( this.publishResponse.SubscriptionId );

                                print( "\tHere's what we need to ack next time: Sub=" + this.publishResponse.SubscriptionId + "; Seq=" + this.publishResponse.NotificationMessage.SequenceNumber );
                                // capture anything that we need for acknowledging on the next trip (Publish call)
                                this.ReceivedSequenceNumbers.push( this.publishResponse.NotificationMessage.SequenceNumber );
                                this.UnAcknowledgedSequenceNumbers.push( this.publishResponse.NotificationMessage.SequenceNumber );
                                this.UnAcknowledgedSequenceTimestamps.push( this.publishResponse.ResponseHeader.Timestamp );

                                print( "\tDataChange event received with '" + dataChangeEvent.MonitoredItems.length + "' MonitoredItem changes." );
                                this.ReceivedDataChanges.push( dataChangeEvent );
                                this.CurrentDataChanges.push( dataChangeEvent );
                            }

                            // EVENTS HANDLING
                            var eventNotification = this.publishResponse.NotificationMessage.NotificationData[d].toEventNotificationList();
                            if( eventNotification !== undefined && eventNotification !== null )
                            {
                                print( "\tEventNotification event received." );
                                print( "\tEventNotification.toString() = " + eventNotification.toString() );
                                this.ReceivedEvents.push( eventNotification );
                                this.CurrentEvents.push(  eventNotification );
                            }

                            // STATUS CHANGE HANDLING
                            var statusChangeEvent = this.publishResponse.NotificationMessage.NotificationData[d].toStatusChangeNotification();
                            if( statusChangeEvent !== undefined && statusChangeEvent !== null )
                            {
                                print( "\tStatusChangeNotification event received." );
                                this.ReceivedStatusChanges.push( statusChangeEvent );
                                this.CurrentStatusChanges.push( statusChangeEvent );
                            }

                        }// for d...
                    }// if... NotificationData.size > 0 

                    // did the server purge some notifications from the queue? If so then we need to revise our 
                    // queues accordingly so that we do not ACK messages that the server no longer knows about.
                    if( this.AvailableSequenceNumbers !== null && this.AvailableSequenceNumbers.length > 0 )
                    {
                        // figure out how many sequences are buffered in the server vs. how many we're currently prepared
                        // to acknowledge. The two must be the same number so we don't introduce errors by attempting to 
                        // acknowledge something that the server has purged from its buffers.
                        var notificationsBufferedInServer = this.AvailableSequenceNumbers.length;
                        var pendingSequencesForSubscription = this.PendingAcknowledgmentsForSubscription( this.publishResponse.SubscriptionId );
                        if( pendingSequencesForSubscription !== notificationsBufferedInServer )
                        {
                            addWarning( "Server PURGED " + (pendingSequencesForSubscription - notificationsBufferedInServer) + " notifications from the queue. Those purged [first/oldest] sequenceNumbers will NOT be acknowledged in the next Publish request." );
                            var removalMessage = "Removed the following SequenceNumbers from the Acknowledgement request for Subscription: " + this.publishResponse.SubscriptionId;
                            var iPosition = 0;
                            while( pendingSequencesForSubscription > notificationsBufferedInServer )
                            {
                                // find the matching sequenceNumber for *this* subscription
                                if( this.SubscriptionIds[iPosition] === this.publishResponse.SubscriptionId )
                                {
                                    // check if the message was purged BEFORE a keep-alive: do this by figuring out: 
                                    //  1. expiration time = notification message timestamp + keepAlive interval
                                    //  2. determine if when we call (this) publish the expiration time had indeed expired
                                    var allowedExpirationDT = this.UnAcknowledgedSequenceTimestamps[iPosition].clone();
                                    // find the subscription so that we can use the RevisedPublishingInterval to determine the lifetime of this
                                    // notification message. 
                                    var currSub;
                                    var currMax
                                    if( this.Subscriptions === null || this.Subscriptions.length === 0 )
                                    {
                                        addError( "The Publish object does not know about the subscription details and therefore cannot determine the lifetime of a notification message necessary for validating whether or not the server has legally purged a notification from the retransmission queue. Please contact the script developer and ask them to invoke the \"RegisterSubscription\" on the Publish object." );
                                    }
                                    else
                                    {
                                        for( var subFindPos=0; subFindPos<this.Subscriptions.length; subFindPos++ )
                                        {
                                            if( this.Subscriptions[subFindPos].SubscriptionId === this.publishResponse.SubscriptionId )
                                            {
                                                currSub = this.Subscriptions[subFindPos];
                                                break;
                                            }
                                        }//for subFindPos
                                    }
                                    if( currSub === undefined || currSub === null )
                                    {
                                        addError( "Publish object does not know of the Subscription with Id: " + this.publishResponse.SubscriptionId + ", and therefore cannot determine if the purged notification messages in the server are legal or not." );
                                    }
                                    else
                                    {
                                        print( "*** allowedExpirationDt (before) = " + allowedExpirationDT );
                                        allowedExpirationDT.addMilliSeconds( parseInt( currSub.RevisedPublishingInterval * currSub.RevisedMaxKeepAliveCount ) );
                                        print( "*** allowedExpirationDt (after) = " + allowedExpirationDT );
                                    }
                                    
                                    // check if the current publish call should've seen the purged messages
                                    var publishResponseDT = this.publishResponse.ResponseHeader.Timestamp;
                                    if( /*publishCallDT*/publishResponseDT >= allowedExpirationDT )
                                    {
                                        addLog( "Server PURGED a notification message from the queue and it was legal!\nThe notification was purged after the mandatory one-KeepAlive interval.\nThe notification was expected to expired at: " + allowedExpirationDT + ", and was indeed purged when checked at: " + /*publishCallDT*/publishResponseDT + "; a difference of: " + Math.abs(allowedExpirationDT.msecsTo(/*publishCallDT*/publishResponseDT)) + " msecs." );
                                        print( "Publish last checked at: " + this.UnAcknowledgedSequenceTimestamps[iPosition] + " - when we saw the notification. The notification should've expired at: " + allowedExpirationDT + ", and was purged when checked at: " + /*publishCallDT*/publishResponseDT + "; a difference of: " + Math.abs(allowedExpirationDT.msecsTo(/*publishCallDT*/publishResponseDT)) + " msecs." );
                                    }
                                    else
                                    {
                                        addError( "Server PURGED a notification message too soon (before the minimum of a keepAlive interval).\nPublish timestamp (responseHeader.Timestamp) when notification was last seen: " + this.UnAcknowledgedSequenceTimestamps[iPosition] + "\nThe notification should've expired at: " + allowedExpirationDT + ", but was already purged when Server responded at: " + /*publishCallDT*/publishResponseDT + " (responseHeader.Timestamp); a difference of: " + Math.abs(allowedExpirationDT.msecsTo(/*publishCallDT*/publishResponseDT)) + " msecs." );
                                    }


                                    // log the message and then remove the sequenceNumber and timestamp from our buffer
                                    removalMessage = "\n\tSequenceNumber: " + this.UnAcknowledgedSequenceNumbers[iPosition];
                                    this.UnAcknowledgedSequenceTimestamps.splice( iPosition, 1 );
                                    this.UnAcknowledgedSequenceNumbers.splice( iPosition, 1 );
                                    this.SubscriptionIds.splice( iPosition, 1 );
                                    // decrement the number of Sequences we needed to purge and then move onto the next record.
                                    pendingSequencesForSubscription--;
                                    continue;
                                }
                                iPosition++;
                            }
                            addLog( removalMessage );
                        }
                    }// AvailableSequenceNumbers !== null

                }
                else
                {
                    success = false;
                }// else... checkPublishValidParameter
            }// if( expectedErrors == undefined )
            else
            {
                if( expectErrorNotFail === undefined )
                {
                    throw( "Publish() argument missing: 'expectErrorNotFail'" );
                }
                if( expectErrorNotFail )
                {
                    success = checkPublishError( this.publishRequest, this.publishResponse, expectedErrors );
                }
                else
                {
                    success = checkPublishFailed( this.publishRequest, this.publishResponse, expectedErrors );
                }
            }// else...if( expectedErrors == undefined )
        }
        else
        {
            addError( "Publish() status " + this.uaStatus, this.uaStatus );
            success = false;
        }

        // display current state of sequence Numbers
        print( "\t\tSubscriptions pending ack: " + this.SubscriptionIds.toString() );
        print( "\t\tReceived sequence numbers: " + this.ReceivedSequenceNumbers.toString() );
        print( "\t\tAcknowledged sequence nos: " + this.AcknowledgedSequenceNumbers.toString() );
        print( "\t\tUnacknowledged sequence #: " + this.UnAcknowledgedSequenceNumbers.toString() );
        print( "\t\tDataChanges received: " + this.ReceivedDataChanges.length );
        print( "\t\tStatusChanges received: "+ this.ReceivedStatusChanges.length );
        print( "\t\tEvents received: " + this.ReceivedEvents.length );
        return( success );
    };

    // checks the values within a dataChange to see which timestamps were returned.
    this.ValidateTimestampsInDataChange = function( dataChange, timestamps )
    {
        var m;
        
        if( dataChange === null || dataChange === undefined ) { return; }
        if( timestamps === null || timestamps === undefined ) { return; }
        print( "Checking timestamps in dataChange. Timestamp enum = " + timestamps );
        for( m=0; m<dataChange.MonitoredItems.length; m++ )
        {
            if( timestamps === TimestampsToReturn.Neither )
            {
                AssertEqual( new UaDateTime(), dataChange.MonitoredItems[m].Value.ServerTimestamp, "SERVER timestamp NOT expected." );
                AssertEqual( new UaDateTime(), dataChange.MonitoredItems[m].Value.SourceTimestamp, "SOURCE timestamp NOT expected." );
            }
            else if( timestamps === TimestampsToReturn.Both )
            {
                AssertNotEqual( new UaDateTime(), dataChange.MonitoredItems[m].Value.ServerTimestamp, "Expected a SERVER timestamp." );
                AssertNotEqual( new UaDateTime(), dataChange.MonitoredItems[m].Value.SourceTimestamp, "Expected a SOURCE timestamp." );
            }
            else if( timestamps === TimestampsToReturn.Server )
            {
                AssertNotEqual( new UaDateTime(), dataChange.MonitoredItems[m].Value.ServerTimestamp, "Expected a SERVER timestamp." );
                AssertEqual( new UaDateTime(), dataChange.MonitoredItems[m].Value.SourceTimestamp, "SOURCE timestamp NOT expected." );
            }
            else if( timestamps === TimestampsToReturn.Source )
            {
                AssertNotEqual( new UaDateTime(), dataChange.MonitoredItems[m].Value.SourceTimestamp, "Expected a SOURCE timestamp." );
                AssertEqual( new UaDateTime(), dataChange.MonitoredItems[m].Value.ServerTimestamp, "SERVER timestamp NOT expected." );
            }
        }//for m...
    };

    this.ValidateTimestampsInAllDataChanges = function( timestamps )
    {
        var d;
        for( d=0; d<this.ReceivedDataChanges.length; d++ )
        {
            this.ValidateTimestampsInDataChange( this.ReceivedDataChanges[d], timestamps );
        }
    };

    // simply prints the values of the CurrentDataChanges
    this.PrintDataChanges = function( doNotPrint )
    {
        var message = "";
        var d;
        if( this.CurrentDataChanges !== undefined && this.CurrentDataChanges !== null && this.CurrentDataChanges.length > 0 )
        {
            for( d=0; d<this.CurrentDataChanges.length; d++ ) // 'd' is for DataChange
            {
                message += Publish.PrintDataChange( this.CurrentDataChanges[d], true );
            }
        }
        else
        {
            message = "No DataChanges to display!";
        }
        if( doNotPrint === undefined || doNotPrint === null || doNotPrint === false )
        {
            print( message );
        }
        return( message );
    };

    // simply prints the values of the ReceivedDataChanges
    this.PrintReceivedDataChanges = function( doNotPrint )
    {
        var message = "";
        var i;
        if( this.ReceivedDataChanges !== undefined && this.ReceivedDataChanges !== null && this.ReceivedDataChanges.length > 0 )
        {
            for( i = 0; i < this.ReceivedDataChanges.length; ++i )
            {
                message += ( "\n\tReceiviedDataChanges[" + i + "]" );
                message += Publish.PrintDataChange( this.ReceivedDataChanges[i], true );
            }
        }
        else
        {
            message = "No ReceivedDataChanges to display!";
        }
        if( doNotPrint === undefined || doNotPrint === null || doNotPrint === false )
        {
            print( message );
        }
        return( message );
    };

    this.PrintEvents = function()
    {
        var message = "";
        var e;
        if( this.CurrentEvents !== undefined && this.CurrentEvents.length > 0 )
        {
            for( e=0; e<this.CurrentEvents.length; e++ ) // 'e' is for Events 
            {
                message += "\tEvent: " +
                    "\n\t\t" + this.CurrentEvents[e].toString();
            }
        }
        else
        {
            message = "No Events to display!";
        }
        print( message );
    };

    this.SetMonitoredItemTypesFromDataChange = function( monitoredItems )
    {
        var d, m, p;
        if( monitoredItems === undefined || monitoredItems.length === undefined || monitoredItems.length === 0 )
        {
            return;
        }
        if( this.CurrentlyContainsData )
        {
            if( this.CurrentDataChanges !== undefined && this.CurrentDataChanges.length > 0 )
            {
                for( d=0; d<this.CurrentDataChanges.length; d++ ) // 'd' is for DataChange
                {
                    for( m=0; m<this.CurrentDataChanges[d].MonitoredItems.length; m++ ) // 'm' for MonitoredItem 
                    {
                        // we need to now find the matching monitoredItem that was passed in
                        for( p=0; p<monitoredItems.length; p++ ) // 'p' is for Parameter
                        {
                            if( monitoredItems[p].ClientHandle === this.CurrentDataChanges[d].MonitoredItems[m].ClientHandle )
                            {
                                monitoredItems[p].DataType = this.CurrentDataChanges[d].MonitoredItems[m].Value.Value.DataType;
                                break;
                            }
                        }// for p...                        
                    }//for m...
                }//for d...
            }//if CurrentDataChanges
        }//if CurrentlyContainsData
    };

    /* iterates thru the current dataChange results (monitoredItems) and then
       searches for each item in the 'items' parameter. Once found, the item in
       the 'items' parameter is updated.
       Parameters:
           - items          : array of MonitoredItem objects to update
           - valuesToUpdate : string value controls what to update, i.e. "vqt"
                                 "v"  = value,
                                 "q"  = quality,
                                 "st" = SERVER timestamp,
                                 "dt" = DEVICE timestamp,
                                 You can vary them, i.e. "v", "vq", "vqstdt"
    */ 
    this.SetItemValuesFromDataChange = function( items, valuesToUpdate )
    {
        var d, m, i;
        if( items === null || items.length === undefined || items.length === 0 ) { return; }
        if( this.CurrentDataChanges === null || this.CurrentDataChanges.length === 0 ) { return; }
        if( valuesToUpdate === undefined || valuesToUpdate === null )
        {
            valuesToUpdate = "vqstdt";
        }
        else
        {
            valuesToUpdate = valuesToUpdate.toLowerCase();
        }
        // more than 1 dataChange may have occurred in the Publish call, so
        // loop through them all...
        print( "\tUpdating " + items.length + " MonitoredItems with values received from Publish." );
        for( d=0; d<this.CurrentDataChanges.length; d++ )
        {
            // within the dataChange, now loop through each monitoredItem
            for( m=0; m<this.CurrentDataChanges[d].MonitoredItems.length; m++ )
            {
                var currentMonitoredItem = this.CurrentDataChanges[d].MonitoredItems[m];
                var currentItem = null;
                // now to find the above monitoredItem in our 'items' parameter:
                for( i=0; i<items.length; i++ )
                {
                    if( items[i].ClientHandle === currentMonitoredItem.ClientHandle )
                    {
                        currentItem = items[i];
                        break;//for i
                    }
                }
                // have we found a match? if so, update the item
                if( currentItem !== null )
                {
                    // update the item's value as specified
                    if( valuesToUpdate.indexOf( "v" ) !== -1 )
                    {
                        print( "\t\tUpdating item[" + m + "] with Value: " + currentMonitoredItem.Value.Value );
                        currentItem.Value.Value = currentMonitoredItem.Value.Value;
                    }
                    if( valuesToUpdate.indexOf( "q" ) !== -1 )
                    {
                        print( "\t\tUpdating item[" + m + "] with Status: " + currentMonitoredItem.Value.StatusCode);
                        currentItem.Value.StatusCode = currentMonitoredItem.Value.StatusCode;
                    }
                    if( valuesToUpdate.indexOf( "st" ) !== -1 )
                    {
                        print( "\t\tUpdating item[" + m + "] with ServerTimestamp: " + currentMonitoredItem.Value.ServerTimestamp );
                        currentItem.Value.ServerTimestamp = currentMonitoredItem.Value.ServerTimestamp;
                    }
                    if( valuesToUpdate.indexOf( "dt" ) !== -1 )
                    {
                        print( "\t\tUpdating item[" + m + "] with SourceTimestamp: " + currentMonitoredItem.Value.SourceTimestamp );
                        currentItem.Value.SourceTimestamp = currentMonitoredItem.Value.SourceTimestamp;
                    }
                }
            }//for m...
        }// for d...
    };

    this.ClearServerNotifications = function()
    {
        // call Publish until a keep-alive is returned - added a 25-call MAX to avoid an endless-loop
        const MAX_PUBLISH_CALL_COUNT = 25;
        var i=0;
        do
        {
            this.Execute();
            print( "Called Publish to clear the Server's queue. Receivied " + ( this.CurrentlyContainsData() === true ? "data" : "keep-alive" ) + ", on iteration " + (1+i) + " of a MAX of " + MAX_PUBLISH_CALL_COUNT + " calls." );
            // incremement the call count and exit if we hit the max
            i++;
            if( i >= MAX_PUBLISH_CALL_COUNT )
            {
                addError( "Unable to Clear the Server's notification queue (when calling Publish) after trying " + i + " times." );
                break;
            }
        } while (this.CurrentlyContainsData());
    };

    this.Clear = function()
    {
        print( "\n***** CLEARING Publish() data *****" );
        this.SubscriptionIds = [];
        this.ReceivedSequenceNumbers       = [];
        this.AcknowledgedSequenceNumbers   = [];
        this.UnAcknowledgedSequenceNumbers = [];
        this.UnAcknowledgedSequenceTimestamps = [];
        this.ReceivedDataChanges   = [];
        this.CurrentDataChanges    = [];
        this.ReceivedStatusChanges = [];
        this.ReceivedEvents = [];
        this.CurrentEvents  = [];
        this.CallCount = 0;
    };

    /*  Nathan Pocock; nathan.pocock@opcfoundation.org
        This function simply returns TRUE/FALSE to identify if the EventQueueOverflowEventType is the first
        notificationMessage received in the results. */
    this.EventQueueOverflowIsFirst = function()
    {
        if( this.publishResponse.NotificationMessage.NotificationData.length === 0 ) { return( false ); }
        var eventNotification = this.publishResponse.NotificationMessage.NotificationData[0].toEventNotificationList();
        return( eventNotification !== null && eventNotification !== undefined );
    };
    
    /*  Nathan Pocock; nathan.pocock@opcfoundation.org
    This function simply returns TRUE/FALSE to identify if the EventQueueOverflowEventType is the LAST
    notificationMessage received in the results. */
    this.EventQueueOverflowIsLast = function()
    {
        if( this.publishResponse.NotificationMessage.NotificationData.length === 0 ) { return( false ); }
        var messagesReceived = this.publishResponse.NotificationMessage.NotificationData.length;
        var eventNotification = this.publishResponse.NotificationMessage.NotificationData[messagesReceived-1].toEventNotificationList();
        return( eventNotification !== null && eventNotification !== undefined );
    };
    
    this.GetNumberOfReceivedMonitoredItems = function()
    {
        var d;
        var numMonitoredItems = 0;
        for( d = 0; d < this.ReceivedDataChanges.length; d++ )
        {
            numMonitoredItems += this.ReceivedDataChanges[d].MonitoredItems.length;
        }
        return numMonitoredItems;
    }
    
    this.HandleIsInCurrentDataChanges = function( handle )
    {
        var m;
        if( handle === undefined || handle === null ){ return( false ); }
        if( this.CurrentlyContainsData() )
        {
                // within the dataChange, now loop through each monitoredItem
            for( m=0; m<this.CurrentDataChanges[0].MonitoredItems.length; m++ )
            {
                if( handle === this.CurrentDataChanges[0].MonitoredItems[m].ClientHandle )
                {
                    return( true );
                }
            }// loop thru monitoredItems
        }
        return( false );
    };

    this.HandleIsInReceivedDataChanges = function( handle )
    {
        var m, d;
        if( handle === undefined || handle === null ){ return( false ); }
        for( d=0; d<this.ReceivedDataChanges.length; d++ )
        {
            // within the dataChange, now loop through each monitoredItem
            for( m=0; m<this.ReceivedDataChanges[d].MonitoredItems.length; m++ )
            {
                if( handle === this.ReceivedDataChanges[d].MonitoredItems[m].ClientHandle )
                {
                    return( true );
                }
            }// loop thru monitoredItems
        }
        return( false );
    };

    this.PendingAcknowledgmentsForSubscription = function( subId )
    {
        var result = 0;
        var i;
        if( subId !== undefined && subId !== null )
        {
            // loop through all subscriptionIds because it has a matching SequenceNumber that is unacked.
            for( i=0; i<this.SubscriptionIds.length; i++ )
            {
                if( this.SubscriptionIds[i] === subId )
                {
                    result++;
                }
            }//for i
        }
        return( result );
    };
    
    this.RegisterSubscription = function( subs )
    {
        // turn the parameter into an array if not one already
        if( subs.length === undefined ){ subs = [subs]; }
        addLog( "Registering " + subs.length + " subscriptions with Publish." );
        // replace subscription if already added
        var found = false;
        for( var o=0; o<subs.length; o++ )
        {
            addLog( "\tSubscription Id: " + subs[o].SubscriptionId );
            for( var i=0; i<this.Subscriptions.length; i++ )
            {
                if( this.Subscriptions[i].SubscriptionId === subs[o].SubscriptionId )
                {
                    this.Subscriptions[i] = subs[o];
                    found = true;
                    break;
                }
            }//for i
            if( !found )
            {
                this.Subscriptions.push( subs[o] );
            }
        }
    }
    
    this.UnregisterSubscription = function( subs )
    {
        // turn the parameter into an array if not one already
        if( subs.length === undefined ){ subs = [subs]; }
        addLog( "Unregistering " + subs.length + " subscriptions from Publish." );
        // find the subscription and remove it from the collection 
        for( var o=0; o<subs.length; o++ )
        {
            addLog( "\tSubscription Id: " + subs[o].SubscriptionId );
            for( var i=0; i<this.Subscriptions.length; i++ )
            {
                if( this.Subscriptions[i].SubscriptionId === subs[o].SubscriptionId )
                {
                    this.Subscriptions.splice( i, 1 );
                    break;
                }
            }//for i
        }//for o
    }
}

Publish.PrintDataChange = function( dataChange, doNotPrint )
{
    var message = "";
    var m;
    for( m=0; m<dataChange.MonitoredItems.length; m++ ) // 'm' for MonitoredItem 
    {
        message +=
            "\n\t\tHandle: " + dataChange.MonitoredItems[m].ClientHandle +
            "; Value: " + dataChange.MonitoredItems[m].Value.Value +
            "; Quality: " + dataChange.MonitoredItems[m].Value.StatusCode +
            "; Time: " + dataChange.MonitoredItems[m].Value.ServerTimestamp.toString();
    }
    if( doNotPrint === undefined || doNotPrint === null || doNotPrint === false )
    {
        print( message );
    }
    return( message );
};

//TESTING
/*
include( "./library/Base/Objects/integerSet.js" );
p = new Publish( new UaSession() );
p.SequenceNumber = 10;
p.SubscriptionId = 20;
print( p.CurrentlyContainsData() );
//p.Execute();
print( "Seq: " + p.SequenceNumber + "; SubId: " + p.SubscriptionId );
*/