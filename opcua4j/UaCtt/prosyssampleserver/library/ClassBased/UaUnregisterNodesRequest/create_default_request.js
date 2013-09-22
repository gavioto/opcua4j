/*global UaUnregisterNodesRequest */

function CreateDefaultUnregisterNodesRequest( session )
{
    var request = new UaUnregisterNodesRequest();
    session.buildRequestHeader( request.RequestHeader );
    return request;
}