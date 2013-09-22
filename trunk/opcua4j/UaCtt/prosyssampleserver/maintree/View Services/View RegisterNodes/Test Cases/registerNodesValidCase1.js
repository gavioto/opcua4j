/*  Test prepared by Hannes Mezger hannes.mezger@ascolab.com
    Description:
        Script demonstrates how to use the checkRegisterNodesValidParameter() function
    Revision History
        04.09.2009 Hannes Mezger: Initial version
*/

var registerRequest  = new UaRegisterNodesRequest();
var registerResponse = new UaRegisterNodesResponse();

Session.buildRequestHeader( registerRequest.RequestHeader );

registerRequest.NodesToRegister[0] = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/Static/All Profiles/Scalar/NodeId1" ).toString() );

var uaStatus = Session.registerNodes( registerRequest, registerResponse );

if( uaStatus.isGood() )
{
    checkRegisterNodesValidParameter( registerRequest, registerResponse );
    
    addLog( "Session.registerNodes() succeeded" );
}
else
{
    addError( "Session.registerNodes() failed: " + uaStatus );
}



