/*
    Description:
        Validates the subscription creation by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP : REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js")

function checkSubscriptionLifetimeCounters( Response )
{
    var bSucceeded = true;
    addLog( "\tRevisedPublishingInterval: " + Response.RevisedPublishingInterval );
    addLog( "\tRevisedMaxKeepAliveCount: "  + Response.RevisedMaxKeepAliveCount );
    if( Response.RevisedPublishingInterval == 0 )
    {
        addError( "The server returned an invalid RevisedPublishingInterval value of: " + Response.RevisedPublishingInterval );
        bSucceeded = false;
    }
    if( Response.RevisedMaxKeepAliveCount == 0 )
    {
        addError( "The server returned an invalid RevisedMaxKeepAliveCount value of: " + Response.RevisedMaxKeepAliveCount );
        bSucceeded = false;
    }
    //make sure there is 3x multiplier between the lifetimeCount and maxKeepAlive
    print( "\tComparing revisedMaxKeepAliveCount*3 = " + (3*Response.RevisedMaxKeepAliveCount) + " against RevisedLifetimeCount = " + Response.RevisedLifetimeCount );
    if( (Response.RevisedMaxKeepAliveCount*3) > Response.RevisedLifetimeCount )
    {
        addError( "The RevisedLifetimeCount should be 3x bigger than RevisedMaxKeepAliveCount. RevisedMaxKeepAliveCount=" + Response.RevisedMaxKeepAliveCount + "; RevisedLifetimeCount=" + Response.RevisedLifetimeCount );
        bSucceeded = false;
    }
    return( bSucceeded );
}

// the service is expected to succeed
// all operations are expected to succeed
function checkCreateSubscriptionValidParameter( Request, Response )
{
    var bSucceeded = true;
    // check in parameters
    if( arguments.length !== 2 )
    {
        addError( "function checkCreateSubscriptionValidParameter(Request, Response): Number of arguments must be 2!" );
        bSucceeded = false;
    }
    // check response header
    bSucceeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader );
    /* checkResponseHeaderValid makes sure the Header is good, but our
       test cases demand the ServiceResult!=Bad_SessionIdInvalid
       so we'll add that below: */
    if( Response.ResponseHeader.ServiceResult.ServiceResult == StatusCode.BadSessionIdInvalid )
    {
        addError( "CreateSubscription returned: Bad_SessionIdInvalid" );
        bSucceeded = false;
    }
    //check the revisedPublishingInterval and revisedMaxKeepAliveCount
    if( !checkSubscriptionLifetimeCounters( Response ) )
    {
        bSucceeded = false;
    }
    return bSucceeded;
}