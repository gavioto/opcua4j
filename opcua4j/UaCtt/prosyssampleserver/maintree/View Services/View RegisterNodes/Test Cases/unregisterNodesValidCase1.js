/*  Test prepared by Hannes Mezger hannes.mezger@ascolab.com
    Description:
        Script demonstrates how to use the checkUnregisterNodesValidParameter() function
    Revision History
        04.09.2009 Hannes Mezger: Initial version
*/

var unregisterRequest  = new UaUnregisterNodesRequest();
var unregisterResponse = new UaUnregisterNodesResponse();

Session.buildRequestHeader( unregisterRequest.RequestHeader );

unregisterRequest.NodesToUnregister[0] = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/Static/All Profiles/Scalar/NodeId1" ).toString() );

var uaStatus = Session.unregisterNodes( unregisterRequest, unregisterResponse );

if( uaStatus.isGood() )
{
    checkUnregisterNodesValidParameter( unregisterRequest, unregisterResponse );
    
    addLog( "Session.unregisterNodes() succeeded" );
}
else
{
    addError( "Session.unregisterNodes() failed: " + uaStatus );
}



