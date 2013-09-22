include( "./library/ServiceBased/SessionServiceSet/CreateSession/isChannelSecure.js" );


function CreateDefaultCreateSessionRequest( sessionObject )
{
    var channel = sessionObject.Channel;
    var request = new UaCreateSessionRequest();
    
    sessionObject.buildRequestHeader( request.RequestHeader );
    
    request.ClientDescription.ApplicationName.Locale = "en";    
    request.ClientDescription.ApplicationName.Text = "OPC Unified Architecture Compliance Test Tool";
    request.ClientDescription.ApplicationType = ApplicationType.Client;
    request.ClientDescription.ApplicationUri = "urn:localhost:UA:CTT";
    request.ClientDescription.ProductUri = "urn:opcfoundation.org:UA:CTT";    
    request.EndpointUrl = readSetting( "/Server Test/Server URL" );
    request.MaxResponseMessageSize = 0;
    request.RequestedSessionTimeout = readSetting( "/Ua Settings/Session/RequestedSessionTimeout" );
    request.SessionName = getNextSessionName();

    if ( isChannelSecure( channel ) )
    {
        request.ClientCertificate = channel.ClientCertificate;        
        request.ClientNonce = UaCryptoProvider.createRandomData( 32 );
        
        // the application uri shall match the uri in the client certificate.
        var cert = UaPkiCertificate.fromDER( channel.ClientCertificate );
        request.ClientDescription.ApplicationUri = cert.URI;
    }
    
    return request;
}