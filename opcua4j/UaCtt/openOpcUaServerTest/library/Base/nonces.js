var serverNonceHistory = [];

// Store a server nonce in the history list.
// Function calls addError() to log a repeated server nonce.
// Returns "false" if the nonce is already in the list, "true" otherwise.
function saveServerNonce( serverNonce )
{
    // Never store empty nonces.
    if ( serverNonce.isEmpty() == true )
    {
        return true;
    }

    for ( var i = 0; i < serverNonceHistory.length; i++ )
    {
        if ( serverNonceHistory[i].equals( serverNonce ) )
        {
            addError( "Server reused a ServerNonce value. This is not allowed as each ServerNonce MUST be unique." );        
            return false;
        }
    }

    serverNonceHistory.push( serverNonce );
    return true;
}

// Checks that a server nonce's length is acceptable.
// Function calls addError() to log an unacceptable nonce length.
// required: "true" if the nonce is mandatory (security enabled), "false" otherwise
// nonce: UaByteString
// returns "true" if the nonce length is acceptable, "false" otherwise.
function checkServerNonceLength( required, nonce )
{
    var checkLength = true;
    
    // If the nonce is not required and the nonce is empty, there's no verification to do.
    // However, if the nonce is not required BUT the server produced a nonce, it must be verified.
    if ( required == false && nonce.isEmpty() == true)
    {
        checkLength = false;
    }
    if ( checkLength == true )
    {
        if ( nonce.length < 32 )
        {
            addError( "Nonce is < 32 bytes, this is not allowed! 32 bytes is the MINIMUM length." );
            return false;
        }
    }
    return true;
}