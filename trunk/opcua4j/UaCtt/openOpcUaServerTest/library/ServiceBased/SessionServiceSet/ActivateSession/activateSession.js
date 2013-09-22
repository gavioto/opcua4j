/*  activateSession - helper object for simplifying calls to ActivateSession
    Revision History:
        26-Mar-2010 NP: Added 'expectedResults' and 'expectErrorNotFail' parameters.
        28-Apr-2010 RTD: Added 'userCredentials" parameter.

    Parameters:
        session            - the SESSION object that maintains the session with UA Server 
        userCredentials    - (OPTIONAL) the user credentials necessary to activate the session ('UserCredentials' object)
        expectedResults    - (OPTIONAL) 'ExpectedAndAcceptedResults' objects
        expectErrorNotFail - (OPTIONAL) True = expect ERROR; False = expect FAILURE */
        
include( "library/Base/identity.js" );        
include( "./library/Base/check_timestamp.js" );
include( "library/ServiceBased/SessionServiceSet/ActivateSession/check_activateSession_error.js" );        
include( "library/ServiceBased/SessionServiceSet/ActivateSession/check_activateSession_failed.js" );        
include( "library/ServiceBased/SessionServiceSet/ActivateSession/check_activateSession_valid.js" );   

var activateSessionRequest  = null;
var activateSessionResponse = null;

function activateSession( session, userCredentials, expectedResults, expectErrorNotFail )
{
    var uaStatus;
    var success = true;
    activateSessionRequest = new UaActivateSessionRequest();
    session.buildRequestHeader( activateSessionRequest.RequestHeader );
    activateSessionResponse = new UaActivateSessionResponse();
    

    // prepare client signatue - only if security is used
    if ( isChannelSecure( session.Channel ) )
    {
        activateSessionRequest.ClientSignature.Algorithm = SignatureAlgorithm.signatureAlgorithmToString( SignatureAlgorithm.AlgorithmUri_Signature_RsaSha1 );

        var data = session.Channel.ServerCertificate.clone();
        data.append( session.ServerNonce );

        // sign the data
        var cryptoProvider = new UaCryptoProvider( session.Channel.RequestedSecurityPolicyUri );
        activateSessionRequest.ClientSignature.Signature.length = cryptoProvider.MaximumAsymmetricKeyLength
        uaStatus = cryptoProvider.asymmetricSign( data, session.Channel.ClientPrivateKey, activateSessionRequest.ClientSignature.Signature );
        if( uaStatus.isGood() )
        {
            addLog( "activateSession - asymmetricSign succeeded." );
        }
        else
        {
            addError( "ActivateSession() asymmetricSign status " + uaStatus, uaStatus );
        }
    }

    // User identity token.
    if ( userCredentials == undefined )
    {
        // Get configured user credentials.
        userCredentials = UserCredentials.createFromSettings( PresetCredentials.AccessGranted1 );
    }

    switch ( userCredentials.Policy )
    {
        case UserTokenType.Anonymous:
            activateSessionRequest.UserIdentityToken = buildAnonymousIdentityToken();
            break;
        case UserTokenType.UserName:
            activateSessionRequest.UserIdentityToken = buildUserNameIdentityToken( session, userCredentials.UserName, userCredentials.Password );
            break;                
    }

    uaStatus = session.activateSession( activateSessionRequest, activateSessionResponse );
    if( uaStatus.isGood() )
    {
        // do we need to check if valid, in error, or failure?
        if( expectErrorNotFail === undefined )
        {
            success = checkActivateSessionValidParameter( session, activateSessionRequest, activateSessionResponse );
            //  read the current time from the server  - we need the time difference later to check the timestamp in the responseHeader
            getServerTimeDiff( session );
        }
        else
        {
            if( expectErrorNotFail )
            {
                success = checkActivateSessionError( session, activateSessionRequest, activateSessionResponse, expectedResults );
            }
            else
            {
                success = checkActivateSessionFailed( activateSessionRequest, activateSessionResponse, expectedResults );
            }
        }
    }
    else
    {
        addError( "ActivateSession() status " + uaStatus, uaStatus );
        success = false;
    }
    return( success );
}