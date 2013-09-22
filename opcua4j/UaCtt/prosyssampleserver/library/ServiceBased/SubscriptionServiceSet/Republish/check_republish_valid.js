/*
    Description:
        Validates the FindServers() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP : REVIEWED.
*/

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );

// the service is expected to succeed
// all operations are expected to succeed
function checkRepublishValidParameter( Request, Response )
{
    var bSucceeded = true;
    // check in parameters
    if( arguments.length !== 2 )
    {
        addError( "function checkRepublishValidParameter(Request, Response): Number of arguments must be 2!" );
        return false;
    }
    // check response header
    if( !checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader ) )
    {
        return false;
    }
    // check the notification message is not null or empty, if serviceResult Good
    if( Response.ResponseHeader.ServiceResult.isGood() )
    {
        if( Response.NotificationMessage == null )
        {
            addError( "Republish error! notificationMessage is null." );
            bSucceeded = false;
        }
        else
        {
            if( Response.NotificationMessage.NotificationData == null || Response.NotificationMessage.NotificationData.length == 0 )
            {
                addError( "Republish error! notificationMessage contains 0 data." );
                bSucceeded = false;
            }
        }
    }
    // check if the notification message has the correct sequence number
    if( Response.NotificationMessage.SequenceNumber !== Request.RetransmitSequenceNumber )
    {
        addError( "The SequenceNumber in the NotificationMessage does not match the RetransmitSequenceNumber." );
        addError( "Request.RetransmitSequenceNumber = " + Request.RetransmitSequenceNumber + " Response.NotificationMessage.SequenceNumber = " + Response.NotificationMessage.SequenceNumber );
        bSucceeded = false;
    }
    return bSucceeded;
}