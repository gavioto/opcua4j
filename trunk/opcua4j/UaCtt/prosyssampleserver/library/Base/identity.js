include( "./library/Base/connectChannel.js" );
include( "./library/Base/disconnectChannel.js" );
include( "./library/Base/Objects/securityalgorithms.js" );

var PresetCredentials = { 
    "AccessGranted1":0,
    "AccessGranted2":1,
    "AccessDenied":2 };

function UserCredentials( params )
{
    this.Policy = params.policy || UserTokenType.Anonymous;
    if ( this.Policy == UserTokenType.UserName)
    {
        this.UserName = params.username || "";
        this.Password = params.password || "";
    }
}

// presetCredentials -> PresetCredentials enum
UserCredentials.createFromSettings = function( presetCredentials )
{
    var params = {};
    var type = parseInt( readSetting( "/Server Test/Session/UserAuthenticationPolicy" ) );
    switch ( type )    
    {
        case UserTokenType.UserName:
        switch ( presetCredentials )
        {
            case PresetCredentials.AccessGranted1:
                usernameSetting = "/Server Test/Session/LoginNameGranted1";
                passwordSetting = "/Server Test/Session/LoginPasswordGranted1"
                break;
            case PresetCredentials.AccessGranted2:
                usernameSetting = "/Server Test/Session/LoginNameGranted2";
                passwordSetting = "/Server Test/Session/LoginPasswordGranted2"
                break;
            case PresetCredentials.AccessDenied:
                usernameSetting = "/Server Test/Session/LoginNameAccessDenied";
                passwordSetting = "/Server Test/Session/LoginPasswordAccessDenied"
                break;
        }
        var username = readSetting( usernameSetting );
        if ( username == null || username == undefined )
        {
            addWarning( "UserCredentials.createFromSettings() - username not set!" );
            username = "";
        }
        else
        {
            username = username.toString();
        }
        var password = readSetting( passwordSetting );
        if ( password == null || password == undefined )
        {
            addWarning( "UserCredentials.createFromSettings() - password not set!" );
            password = "";
        }
        else
        {
            password = password.toString();
        }
        params = { policy:type, username:username, password:password };
        break;
    }
    return new UserCredentials( params );
}

function needAnonymousToken( securityPolicyUri )
{
    // This function checks if the server requires an anonymous identity token for 
    // anonymous access. It is needed because the server may not require one when
    // the only access policy is anonymous. In these cases the client can't reply with
    // any token.
    
    // securityPolicyUri - the URI of the security policy
    
    // *** WE NEED THE PROFILE URI ENUMERATION IN THE CTT!!!! *****
    const TCPSECURITYPROFILEURI = "http://opcfoundation.org/UA-Profile/Transport/uatcp-uasc-uabinary";
      
    //  GetEndpoints is used to find the supported tokens.
    var channel = new UaChannel();
    var discovery = new UaDiscovery( channel );
    
    connectChannelNoSecurity( channel, readSetting( "/Server Test/Discovery URL" ) );

    var request = new UaGetEndpointsRequest();
    var response = new UaGetEndpointsResponse();
    request.EndpointUrl = readSetting( "/Server Test/Discovery URL" );
    request.ProfileUris[0] = TCPSECURITYPROFILEURI;
    discovery.getEndpoints( request, response );
    disconnectChannel( channel );
    for ( var i = 0; i < response.Endpoints.length; i++ )
    {
        var description = response.Endpoints[i];
        if ( description.SecurityPolicyUri == securityPolicyUri )
        {
            return ( description.UserIdentityTokens.length != 0 );
        }
    }
    return true;
}

function getUserTokenPolicy( securityPolicyUri, tokenType )
{
    // This function returns the user token policy, given the security policy of the
    // endpoint and the authentication token type. It only considers UA-TCP endpoints (the ones
    // used by the CTT). If a token policy cannot be found for the given token type, null
    // is returned.
    
    // securityPolicyUri - the URI of the security policy
    // tokenType - UserTokenType
    
    // *** WE NEED THE PROFILE URI ENUMERATION IN THE CTT!!!! *****
    const TCPSECURITYPROFILEURI = "http://opcfoundation.org/UA-Profile/Transport/uatcp-uasc-uabinary";

    // GetEndpoints is used to get the user token policies.
    var channel = new UaChannel();
    var discovery = new UaDiscovery( channel );
    if ( !connectChannelNoSecurity( channel, readSetting( "/Server Test/Server URL" ) ) )
    {
        addError( "getUserTokenPolicy failed - could not connect to channel" );
    }
    else
    {
        var request = new UaGetEndpointsRequest();
        var response = new UaGetEndpointsResponse();
        request.EndpointUrl = readSetting( "/Server Test/Server URL" );
        request.ProfileUris[0] = TCPSECURITYPROFILEURI;
        var status = discovery.getEndpoints( request, response );
        disconnectChannel( channel );
        if ( status.isBad() )
        {
            addError( "getUserTokenPolicy failed - GetEndpoints failed" );
        }
        else
        {
            for ( var i = 0; i < response.Endpoints.length; i++ )
            {
                var description = response.Endpoints[i];
                //print( "\tgetUserTokenPolicy: received Endpoint description: " + description.toString() );
                if ( description.SecurityPolicyUri == securityPolicyUri )
                {
                    for ( var j = 0; j < description.UserIdentityTokens.length; j++)
                    {
                        //print( "\t\tgetUserTokenPolicy: received userIdentityToken: " + description.UserIdentityTokens[j].toString() );
                        var token = description.UserIdentityTokens[j];
                        if ( token.TokenType == tokenType )
                        {
                            print( "\tgetUserTokenPolicy( \"" + securityPolicyUri + "\", \"" + tokenType + "\"; returning: " + token + ")" );
                            return token;
                        }
                    }
                }
            }
        }
    }
    return null;
}

function buildAnonymousIdentityToken()
{
    var obj = new UaExtensionObject();
    var policy = parseInt( readSetting( "/Ua Settings/Secure Channel/RequestedSecurityPolicyUri" ) );
    var securityPolicyUri = SecurityPolicy.policyToString( policy );
    
    // Does the server require an anonymous token or does it accept an empty one?
    if ( needAnonymousToken( securityPolicyUri ) )
    {
        // Get the anonymous policy description.
        var policy = getUserTokenPolicy( securityPolicyUri, UserTokenType.Anonymous );
        if ( policy == null )
        {
            addError( "buildAnonymousIdentityToken - anonymous token policy unavailable" );            
        }
        else
        {
            var token = new UaAnonymousIdentityToken();
            token.PolicyId = policy.PolicyId;
            obj.setAnonymousIdentityToken( token );
        }
    }
    return obj;
}

function buildUserNameIdentityToken( session, username, password )
{
    var obj = new UaExtensionObject();
    var channelSecurityPolicy = SecurityPolicy.policyToString( session.Channel.RequestedSecurityPolicyUri );
    
    // Get the username policy description.
    var tokenPolicy = getUserTokenPolicy( channelSecurityPolicy, UserTokenType.UserName );
    if ( tokenPolicy == null )
    {
        addError( "buildUserNameIdentityToken - username token policy unavailable" );            
    }
    else
    {    
        var token = new UaUserNameIdentityToken();
        var encodedPassword = new UaByteString();
        token.PolicyId = tokenPolicy.PolicyId;
        token.UserName = username;
        
        // Get the security policy for encrypting the password.
        var tokenSecurityPolicy = tokenPolicy.SecurityPolicyUri;
        if ( tokenSecurityPolicy.length == 0 ||
             tokenSecurityPolicy == SecurityPolicy.policyToString( SecurityPolicy.None ) )
        {
            // No explicity security policy for encrypting the password. Use the channel's security
            // policy.
            tokenSecurityPolicy = channelSecurityPolicy
        }
            
        if ( tokenSecurityPolicy == SecurityPolicy.policyToString( SecurityPolicy.None ) )
        {
            addLog( "buildUserNameIdentityToken - password not encrypted!" );
            encodedPassword.setUtf8FromString( password );
        }
        else
        {
            var plainPassword = new UaByteString();
            var encryptedPassword = new UaByteString();
            var serverNonce = session.ServerNonce;
            var serverPublicKey = UaPkiCertificate.publicKeyFromDER( session.Channel.ServerCertificate );
                
            // Set the length of the encoded password.
            encodedPassword.setUInt32( password.length + serverNonce.length );

            // Encode the password.
            plainPassword.setUtf8FromString( password );
            encodedPassword.append( plainPassword );

            // Append the server nonce.
            encodedPassword.append( serverNonce );
                
            addLog( "Requesting user credentials: username='" + username + "'; password='" + password + "'; securityPolicyUri='" + tokenSecurityPolicy + "'" );
            // Encrypt the encoded password.
            var cryptoProvider = new UaCryptoProvider( SecurityPolicy.policyFromString( tokenSecurityPolicy ) );
            var status = cryptoProvider.asymmetricEncrypt( encodedPassword, serverPublicKey, encryptedPassword );
            if ( status.isBad() )
            {
                addError( "buildUserNameIdentityToken - error encrypting the password!" );            
            }
            else
            {
                var algorithms = SecurityAlgorithms.getAlgorithms( SecurityPolicy.policyFromString( tokenSecurityPolicy ) );
                
                token.Password = encryptedPassword;
                token.EncryptionAlgorithm = algorithms.AsymmetricEncryptionAlgorithm;
            }
        }
    }
    
    obj.setUserNameIdentityToken( token );
    return obj;
}