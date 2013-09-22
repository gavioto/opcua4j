/*  Test <number> prepared by Development; compliance@opcfoundation.org
    Description:
        
    Revision History
        25-Aug-2009 DEV: Initial version
*/
/*
var registerServerRequest = new UaRegisterServerRequest();
var registerServerResponse = new UaRegisterServerResponse();

registerServerRequest.RequestHeader.Timestamp = UaDateTime.utcNow();
registerServerRequest.Server.DiscoveryUrls[0] = "DiscoveryUrl_1";
registerServerRequest.Server.GatewayServerUri = "GatewayServerUri";
registerServerRequest.Server.IsOnline = true;
registerServerRequest.Server.ProductUri = "ProductUri";
registerServerRequest.Server.SemaphoreFilePath = "SemaphoreFilePath";
registerServerRequest.Server.ServerNames[0] = "ServerName_1";
registerServerRequest.Server.ServerType = ApplicationType.Server;
registerServerRequest.Server.ServerUri = "ServerUri";

uaStatus = g_discovery.registerServer( registerServerRequest,registerServerResponse );

// check result
if(uaStatus.isGood())
{
    checkRegisterServerValidParameter( registerServerRequest, registerServerResponse );
}
else
{
    addError( "registerServer() failed", uaStatus );
}
*/