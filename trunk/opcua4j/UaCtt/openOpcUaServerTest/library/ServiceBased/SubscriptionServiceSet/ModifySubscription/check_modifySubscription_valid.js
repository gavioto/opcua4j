/*
    Description:
        Validates the subscription modification by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP : REVIEWED.
*/

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );

// the service is expected to succeed
// all operations are expected to succeed
function checkModifySubscriptionValidParameter( Request, Response )
{
    var bSucceeded = true;
    // check in parameters
    if( arguments.length !== 2 )
    {
        addError( "function checkModifySubscriptionValidParameter(Request, Response): Number of arguments must be 2!" );
        return false;
    }
    // check response header
    bSucceeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader );
    // general checks state to check for Bad_SessionIdInvalid
    if( Response.ResponseHeader.ServiceResult.ServiceResult == StatusCode.BadSessionIdInvalid )
    {
        addError( "Service result is Bad_SessionIdInvalid" );
        bSucceeded = false;
    }
    //check the revisedPublishingInterval and revisedMaxKeepAliveCount
    if( !checkSubscriptionLifetimeCounters( Response ) )
    {
        bSucceeded = false;
    }
    return bSucceeded;
}