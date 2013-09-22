/*
    Description:
        Validates the CreateSession() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
        04-Mar-2010 RTD: Checking the server cert returned from the CreateSession response against the one used to create the secure channel.
                         Verifying the server's signature.
*/

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );
include( "./library/ClassBased/UaDiagnosticInfo/check_serverSupportsDiagnostics.js" );
include( "./library/ServiceBased/SessionServiceSet/CreateSession/isChannelSecure.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
include( "./library/Base/nonces.js" );
include( "./library/Base/Objects/monitoredItem.js" );

// Validate that the requested SessionName is the BrowseName of the session Node.
// request and response are CreateSession's request and response.
function checkSessionBrowseName( session, request, response )
{
    //check sessionName is as requested (if requested)
    if( request.SessionName !== null && request.SessionName !== "" )
    {
        addLog( "Read the BrowseName on the SessionId node (for this session). Node Id: " + response.SessionId );
        var sessionItem = MonitoredItem.fromNodeIds( [ response.SessionId ], Attribute.BrowseName );
        var read = new Read( session );
        if ( read.Execute( sessionItem ) )
        {
            AssertEqual( request.SessionName, read.readResponse.Results[0].Value.toQualifiedName().Name, "SessionName is not as specified" );
        }
        else
        {
            addError( "When reading the BrowseName of a NodeId matching the current session, the value returned should match the SessionName established in the CreateSession call." );
        }
        // clean-up
        read = null;
    }
    else
    {
        addLog( "Session name is empty, per the Request: '" + request.SessionName + "'" );
    }
}


// the service is expected to succeed
// all operations are expected to succeed
// SuppressNameValidation (boolean): suppress the session name validation when activating the session is not an option.
function checkCreateSessionValidParameter( Session, Request, Response, SuppressNameValidation )
{
    var succeeded = true;
    var status;

    // do we need to check the session exists in the server's address space?
    var SuppressNameValidation = ( SuppressNameValidation === undefined ? false : SuppressNameValidation );
    
    // check response header
    succeeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader );
    if( !succeeded )
    {
        return( succeeded );
    }

    // check the session name (if the server supports diagnostics)
    // this check requires the session to be activated.
    if( SuppressNameValidation == false )
    {
        addLog( "Detecting server support for Diagnostics..." );
        if( check_serverSupportsDiagnostics( Session ) )
        {
            addLog( "Diagnostics supported! Locating Session name in servers address space..." );
            if ( Request.SessionName.length > 0 )
            {
                succeeded = checkSessionBrowseName( Session, Request, Response );
            }
        }
    }

    // Check the server nonce.
    var nonceRequired = isChannelSecure( Session.Channel );
    succeeded = checkServerNonceLength( nonceRequired, Response.ServerNonce );

    // Check if nonce is unique.
    succeeded = saveServerNonce( Response.ServerNonce );        

    // The following checks are done only when the channel is secured.
    if( isChannelSecure( Session.Channel ) )
    {    
        // Check that the server application certificate is provided and valid.
        if ( Response.ServerCertificate.isEmpty() )
        {
            addError( "Server application instance certificate not provided." );
            succeeded = false;
        }
        else
        {
            // create and configure PkiProvider    
            var g_pkiProvider = new UaPkiUtility();
            g_pkiProvider.CertificateTrustListLocation = readSetting( "/Ua Settings/Certificates/CertificateTrustListLocation" );
            g_pkiProvider.CertificateRevocationListLocation = readSetting( "/Ua Settings/Certificates/CertificateRevocationListLocation" );
            g_pkiProvider.PkiType = PkiType.OpenSSL_PKI;

            status = g_pkiProvider.validateCertificate( Response.ServerCertificate );
            if ( status.isBad() )
            {
                addError( "Server application instance certificate does not validate. Error: " + status.toString(), status );
                succeeded = false;
            }
            else
            {
                addLog( "Server Certificate validated successfully (according to the PKI provider)." );
            }
        }

        // check if the server certificate is the same as the one used for creating the channel
        if( !Session.Channel.ServerCertificate.equals( Response.ServerCertificate ) )
        {
            addError( "ServerCertificate returned in CreateSessionResponse is different than the one used in CreateChannel" );
            succeeded = false;
        }      

        // check the software certificates are provided and are valid.
        notImplemented( "Check the software certificates are provided and are valid." );

        // check the serverSignature is correct
        // the serverSignature is generated by appending the client nonce to the client
        // certificate and signing the resulting bytes with the server private key.

        // the server's public key is needed to validate the signature.
        var serverPublicKey = UaPkiCertificate.publicKeyFromDER( Response.ServerCertificate );

        // append the client nonce to the client certificate.
        var signedData = new UaByteString();
        signedData.append( Request.ClientCertificate );
        signedData.append( Request.ClientNonce );

        // verify the signature.
        var crypto = new UaCryptoProvider( Session.Channel.RequestedSecurityPolicyUri );
        status = crypto.asymmetricVerify( signedData, serverPublicKey, Response.ServerSignature.Signature ); 
        if ( status.isBad() )
        {
            addError( "Server signature is invalid." );
            succeeded = false;
        } 
    }
    //check the sessionId is not null
    if( Response.SessionId == null || Response.SessionId.equals( new UaNodeId() ) )
    {
        addError( "SessionId is null/empty. This is not allowed!" );
        succeeded = false;
    }
    //check the authenticationToken is not null
    if( Response.AuthenticationToken == null || Response.AuthenticationToken.equals( new UaNodeId() ) )
    {
        addError( "AuthenticationToken is null/empty. This is not allowed." );
        succeeded = false;
    }
    return succeeded;
}