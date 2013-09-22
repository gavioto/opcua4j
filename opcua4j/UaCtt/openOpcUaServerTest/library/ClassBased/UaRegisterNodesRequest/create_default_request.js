/*global UaRegisterNodesRequest */

function CreateDefaultRegisterNodesRequest( session )
{
    var request = new UaRegisterNodesRequest();
    session.buildRequestHeader( request.RequestHeader );
    return request;
}