include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );

// the service is expected to succeed
// all operations are expected to succeed
function checkTransferSubscriptionValidParameter( Request, Response, ignoreNotSupportedErr )
{
    var bSucceeded = true;
    // check in parameters
    if( arguments.length !== 2 )
    {
        addError( "function checkTransferSubscriptionValidParameter(Request, Response): Number of arguments must be 2!" );
        bSucceeded = false;
    }
    // check response header
    bSucceeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader );
    // check for "not supported"
    if( Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadNotImplemented
        || Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadServiceUnsupported  )
    {
        addNotSupported( "TransferSubscription." );
        if( ignoreNotSupportedErr === undefined || ignoreNotSupportedErr == null )
        {
            ignoreNotSupportedErr = false;
        }
        if( ignoreNotSupportedErr === false )
        {
            addError( "TransferSubscription is a required Service. Verify if this Conformance Unit should be selected for testing." );
        }
        return( false );
    }
    // general checks state to check for Bad_SessionIdInvalid
    if( Response.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadSessionIdInvalid )
    {
        addError( "TransferSubscription returned: Bad_SessionIdInvalid" );
        return( false );
    }
    
    // check operation results
    bSucceeded = bSucceeded && AssertEqual( Request.SubscriptionIds.length, Response.Results.length, "transferSubscriptions: number of Request.SubscriptionIds did not match the number of Response.Results" );
    for( var i = 0; i < Response.Results.length; i++ )
    {
        bSucceeded = bSucceeded && AssertStatusCodeIs( StatusCode.Good, Response.Results[i].StatusCode, "transferSubscriptions: Response.Results[" + i + "] is not Good" );
    }
    return bSucceeded;
}