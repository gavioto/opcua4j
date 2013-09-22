function isChannelSecure( Channel )
{
    var secured = true;
    
    // Check if the channel is unsecured.
    if ( Channel.RequestedSecurityPolicyUri == SecurityPolicy.SecurityPolicy_None ||
         Channel.MessageSecurityMode == MessageSecurityMode.None )
    {
        secured = false;
    }
    
    return( secured );
}