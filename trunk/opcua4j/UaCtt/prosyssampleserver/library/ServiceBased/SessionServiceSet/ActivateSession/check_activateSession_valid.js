/*
    Description:
        Validates the ActivateSession() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP : REVIEWED.
        27-May-2010 RTD: Response header and nonce validation were being ignored.
*/
include( "library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );
include( "./library/ServiceBased/SessionServiceSet/CreateSession/isChannelSecure.js" );
include( "./library/Base/nonces.js" );

// the service is expected to succeed
// all operations are expected to succeed
function checkActivateSessionValidParameter( Session, Request, Response )
{
    var bSucceeded = true;
    // check in parameters
    if ( arguments.length !== 3 )
    {
        addError( "function checkActivateSessionValidParameter(): Number of arguments must be 3!" );
        return( false );
    }
    // check response header
    if( checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader, null, true ) == false )
    {
        bSucceeded = false;
    }
    
    // Check the server nonce.
    var nonceRequired = isChannelSecure( Session.Channel );
    if( checkServerNonceLength( nonceRequired, Response.ServerNonce ) == false )
    {
        bSucceeded = false;
    }

    // Check if nonce is unique.
    if( saveServerNonce( Response.ServerNonce ) == false )
    {
        bSucceeded = false;
    }
    
    // check results        
    // check number of results
    if( Response.Results.length !== Request.ClientSoftwareCertificates.length )
    {
        addError( "The number of results does not match the number of ClientSoftwareCertificates." );
        addError( "ClientSoftwareCertificates.length = " + Request.ClientSoftwareCertificates.length + " Results.length = " + Response.Results.length );
        bSucceeded = false;
    }
    else
    {        
        // check each result
        for( i=0; i<Response.Results.length; i++ )
        {
            // status code
            if( Response.Results[i].isNotGood() )
            {
                addError( "Results[" + i + "] is not good. ", Response.Results[i]);
                bSucceeded = false;
                continue;
            }
        }
    }
    return bSucceeded;
}