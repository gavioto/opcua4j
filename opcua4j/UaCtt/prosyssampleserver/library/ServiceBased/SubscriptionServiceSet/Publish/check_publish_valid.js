/*
    Description:
        Validates the Publish() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP : REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js")

// the service is expected to succeed
// all operations are expected to succeed
function checkPublishValidParameter( Request, Response )
{
    print( "\tPublish validation (begins)" );
    var bSucceeded = true;
    // check in parameters
    if( arguments.length !== 2 )
    {
        addError( "function checkPublishValidParameter(Request, Response): Number of arguments must be 2!" );
        return false;
    }
    // as this is a valid parameter test we don't expect any diagnositcinfo        
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "PublishResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected." );
        bSucceeded = false;
    }
    // check response header
    if( !checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader, StatusCode.Good ) )
    {
        return false;
    }
    // check number of results
    if( Response.Results.length !== Request.SubscriptionAcknowledgements.length )
    {
        addError( "The number of results does not match the number of SubscriptionAcknowledgements." );
        addError( "SubscriptionAcknowledgements.length = " + Request.SubscriptionAcknowledgements.length + " Results.length = " + Response.Results.length );
        bSucceeded = false;
    }
    else
    {        
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            // status code
            if( Response.Results[i].isNotGood() )
            {
                addError( "Results[" + i + "] is not good: " + Response.Results[i], Response.Results[i] );
                bSucceeded = false;
            }
        }
    }
    // AvailableSequenceNumbers 
    // does *this* Publish response contain any dataChanges? if so then does the sequenceNumber also 
    // appear in the AvailableSequenceNumbers collection?
    print( "\tSequenceNumber: Checking if there are notificationMessages in the Publish response. Notifications count: " +
        Response.NotificationMessage.NotificationData.length );
    if( Response.NotificationMessage !== null && Response.NotificationMessage.NotificationData.length > 0 )
    {
        // the Publish response can contain notifications for StatusChanges, Events, and also 
        // DataChanges. Below, we will look for DataChanges only to determine that the 
        // sequenceNumber acknowledged is not in the AvailableSequenceNumbers list.
        for( var n=0; n<Response.NotificationMessage.NotificationData.length; n++ )
        {
            // we only care for DataChanges...
            var thisNotification = Response.NotificationMessage.NotificationData[n].toDataChangeNotification();
            if( thisNotification === null )
            {
                // notification was not a dataChange, so was it an Event?
                thisNotification = Response.NotificationMessage.NotificationData[n].toEventNotificationList();
            }
            if( thisNotification !== null )
            {
                var currentSeq = Response.NotificationMessage.SequenceNumber;
                print( "\tSequenceNumber: DataChanges were found in this Publish response, looking for SequenceNumber '" + 
                    currentSeq + "' in the AvailableSequenceNumbers collection, length: " + 
                    Response.AvailableSequenceNumbers.length );
                // see if we can find this sequenceNumber in the availableSequenceNumbers - WE EXPECT IT!
                var seqFound = false;
                for( var a=0; a<Response.AvailableSequenceNumbers.length; a++ )
                {
                    print( "\t\tAvailableSequenceNumbers[" + a + "] = " + Response.AvailableSequenceNumbers[a] );
                    if( Response.AvailableSequenceNumbers[a] === currentSeq )
                    {
                        seqFound = true;
                        break;
                    }
                }
                AssertTrue( seqFound, "Expected to find the SequenceNumber '" + currentSeq + "' in this Publish response to be present in the AvailableSequenceNumbers collection since it has not been acknowledged and should therefore be available for ReTransmission." );
            }
            else
            {
                addLog( "Publish response SequenceNumber validation skipped notificationData[" + n + "] because it is NOT a DataChange notification." );
            }
        }
    }
    if( Response.AvailableSequenceNumbers.length === 0 )
    {
        print( "\tAvailableSequenceNumbers empty... skipping checks." );
    }
    else
    {
        // check the availableSequenceNumbers parameter/array and check that any
        // values stored within it are consecutively stored and in numeric order.
        print( "\tChecking order of AvailableSequenceNumbers... (" + Response.AvailableSequenceNumbers.length + " returned)" );
        var previousValue = -1;
        for( var a=0; a<Response.AvailableSequenceNumbers.length; a++ )
        {
            // is this the same sequenceNumber as last time?
            if( previousValue !== Response.AvailableSequenceNumbers[a] )
            {
                if( !AssertGreaterThan( previousValue, Response.AvailableSequenceNumbers[a], "AvailableSequenceNumbers are not in numeric order!" ) )
                {
                    bSucceeded = false;
                }
                previousValue = Response.AvailableSequenceNumbers[a];
            }
        }// for a...
        // now checking AvailableSequenceNumbers to make sure that none of the 
        // acknowledged sequenceNumbers appear.
        print( "\tChecking if acknowledged sequenceNumbers appear in AvailableSequenceNumbers." );
        for( var i=0; i<Response.AvailableSequenceNumbers.length; i++ )
        {
            for( var a=0; a<Request.SubscriptionAcknowledgements.length; a++ )
            {
                // make sure the request/response refer to the same subscription in the ack
                if( Request.SubscriptionAcknowledgements[a].SubscriptionId == Response.SubscriptionId )
                {
                    // check sequenceNumber previously acknowledged does show as still available
                    if( Request.SubscriptionAcknowledgements[a].SequenceNumber === Response.AvailableSequenceNumbers[i] )
                    {
                        addError( "AvailableSequenceNumbers should NOT contain acknowledged SequenceNumbers" );
                        bSucceeded = false;
                        break;
                    }
                }
            }
        }
    }
    print( "\tPublish validation ends" );
    return bSucceeded;
}