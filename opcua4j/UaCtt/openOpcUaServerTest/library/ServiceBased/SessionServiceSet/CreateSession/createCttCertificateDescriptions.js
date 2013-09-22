//Prepares the parameters for the certificate descriptions etc.
function createCttCertificateDescriptions( sessionRequest, sessionObject )
{
    sessionRequest.ClientDescription.ApplicationUri = "Ua CTT - Application Uri";
    sessionRequest.ClientDescription.ProductUri = "Ua CTT - Product Uri";
    sessionRequest.ClientDescription.ApplicationName.Locale = "en";
    sessionRequest.ClientDescription.ApplicationName.Text = "Ua CTT - Application Name";
    sessionRequest.ClientDescription.ApplicationType = ApplicationType.Client;
    sessionRequest.ServerUri = "";
    sessionRequest.EndpointUrl = readSetting("/Server Test/Server URL");
    sessionRequest.SessionName = "Ua CTT - Session Name createSessionValidCase1";
    sessionRequest.ClientNonce = new UaByteString();
    sessionRequest.ClientCertificate = sessionObject.Channel.ClientCertificate;
    sessionRequest.RequestedSessionTimeout = 1000000;
    sessionRequest.MaxResponseMessageSize = 0;
}