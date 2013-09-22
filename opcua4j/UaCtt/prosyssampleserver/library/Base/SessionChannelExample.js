var test_channel = new UaChannel();
var test_session_1 = new UaSession( test_channel );
var test_session_2 = new UaSession( test_channel );
var uaStatus = new UaStatusCode();

var url = readSetting( "/Server Test/Server URL" );

//************************
// connect channel
uaStatus = test_channel.connect( url );
print( "connect() returned: " + uaStatus, uaStatus );

//************************
// create session 1
var createSessionRequest = new UaCreateSessionRequest();
var createSessionResponse = new UaCreateSessionResponse();
test_session_1.buildRequestHeader( createSessionRequest.RequestHeader );

createSessionRequest.ClientDescription.ApplicationUri = "Ua CTT - Application Uri"
createSessionRequest.ClientDescription.ProductUri = "Ua CTT - Product Uri"
createSessionRequest.ClientDescription.ApplicationName.Locale = "en"
createSessionRequest.ClientDescription.ApplicationName.Text = "Ua CTT - Application Name"
createSessionRequest.ClientDescription.ApplicationType = ApplicationType.Client
createSessionRequest.ServerUri = ""
createSessionRequest.EndpointUrl = readSetting("/Server Test/Server URL")
createSessionRequest.SessionName = "Ua CTT - Session Name Session 1"
createSessionRequest.ClientNonce = new UaByteString("FF00FF00FF00FF00FF00FF00FF00FF00")
createSessionRequest.ClientCertificate = test_channel.ClientCertificate
// or
//createSessionRequest.ClientCertificate = test_session.Channel.ClientCertificate
createSessionRequest.RequestedSessionTimeout = 1000000
createSessionRequest.MaxResponseMessageSize = 0
    
uaStatus = test_session_1.createSession( createSessionRequest, createSessionResponse );
print( "createSession() returned: " + uaStatus, uaStatus );

//************************
// create session 2
var createSessionRequest = new UaCreateSessionRequest();
var createSessionResponse = new UaCreateSessionResponse();
test_session_2.buildRequestHeader( createSessionRequest.RequestHeader );

createSessionRequest.ClientDescription.ApplicationUri = "Ua CTT - Application Uri"
createSessionRequest.ClientDescription.ProductUri = "Ua CTT - Product Uri"
createSessionRequest.ClientDescription.ApplicationName.Locale = "en"
createSessionRequest.ClientDescription.ApplicationName.Text = "Ua CTT - Application Name"
createSessionRequest.ClientDescription.ApplicationType = ApplicationType.Client
createSessionRequest.ServerUri = ""
createSessionRequest.EndpointUrl = readSetting("/Server Test/Server URL")
createSessionRequest.SessionName = "Ua CTT - Session Name Session2"
createSessionRequest.ClientNonce = new UaByteString()
createSessionRequest.ClientCertificate = test_channel.ClientCertificate
createSessionRequest.RequestedSessionTimeout = 1000000
createSessionRequest.MaxResponseMessageSize = 0
    
uaStatus = test_session_2.createSession( createSessionRequest, createSessionResponse );
print( "createSession() returned: " + uaStatus, uaStatus );

//************************
// activate session 1
var activateSessionRequest = new UaActivateSessionRequest();
var activateSessionResponse = new UaActivateSessionResponse();
test_session_1.buildRequestHeader( activateSessionRequest.RequestHeader );

uaStatus = test_session_1.activateSession( activateSessionRequest, activateSessionResponse );
print( "activateSession() returned: " + uaStatus, uaStatus );

//************************
// activate session 2
var activateSessionRequest = new UaActivateSessionRequest();
var activateSessionResponse = new UaActivateSessionResponse();
test_session_2.buildRequestHeader( activateSessionRequest.RequestHeader );

uaStatus = test_session_2.activateSession( activateSessionRequest, activateSessionResponse );
print( "activateSession() returned: " + uaStatus, uaStatus );

//************************
// close session 1
var closeSessionRequest = new UaCloseSessionRequest();
var closeSessionResponse = new UaCloseSessionResponse();
test_session_1.buildRequestHeader( closeSessionRequest.RequestHeader );

uaStatus = test_session_1.closeSession( closeSessionRequest, closeSessionResponse );
print( "closeSession() returned: " + uaStatus, uaStatus );

//************************
// close session 2
var closeSessionRequest = new UaCloseSessionRequest();
var closeSessionResponse = new UaCloseSessionResponse();
test_session_2.buildRequestHeader( closeSessionRequest.RequestHeader );

uaStatus = test_session_2.closeSession( closeSessionRequest, closeSessionResponse );
print( "closeSession() returned: " + uaStatus, uaStatus );

//************************
// disconnect channel
uaStatus = test_channel.disconnect();
print( "disconnect() returned: " + uaStatus, uaStatus );