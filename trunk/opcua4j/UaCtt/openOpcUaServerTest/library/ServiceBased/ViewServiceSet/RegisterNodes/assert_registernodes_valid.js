/*global include, UaReadRequest, UaReadResponse, Session,
  Attribute, addError, AssertEqual, checkResponseHeaderValid,
  AssertBrowseNamesEqual, AssertNodeIdsEqual
*/

include( "./library/Base/assertions.js" );
include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );

function ReadBrowseNameOfRegisteredNode( nodeId )
{
    var request = new UaReadRequest();
    var response = new UaReadResponse();
    Session.buildRequestHeader( request.RequestHeader );

    request.NodesToRead[0].NodeId = nodeId;
    request.NodesToRead[0].AttributeId = Attribute.BrowseName;

    var uaStatus = Session.read( request, response );

    // check result
    if( !uaStatus.isGood() )
    {
        addError( "Read() status " + uaStatus, uaStatus );
    }
    AssertEqual( 1, response.Results.length, "Read() Results was not the correct length" );
    return response.Results[0].Value;
}


// the service is expected to succeed
// all operations are expected to succeed
function assertRegisterNodesSuccess( request, response, nodesMustExist )
{
    if( arguments.length < 2 )
    {
        addError( "assertRegisterNodesSuccess(): Number of arguments must be " + assertRegisterNodesSuccess.length );
        return;
    }
    else if( nodesMustExist === undefined )
    {
        nodesMustExist = true;
    }

    // check response header
    checkResponseHeaderValid( request.RequestHeader, response.ResponseHeader, StatusCode.Good );
    
    // check results
    // check number of results
    if( AssertEqual( request.NodesToRegister.length, response.RegisteredNodeIds.length, "The number of NodesToRegister does not match the number of RegisteredNodeIds." ) )
    {        
        /* validate that each returned reference is correct by reading from the 
           original nodeId and the returned nodeId */
        for( var i = 0; i < response.RegisteredNodeIds.length; i++ )
        {
            var originalBrowseName = ReadBrowseNameOfRegisteredNode( request.NodesToRegister[i] );
            if( !originalBrowseName.isEmpty() )
            {
                // NodeId exists, so compare the BrowseName to the registered node's BrowseName
                var registeredBrowseName = ReadBrowseNameOfRegisteredNode( response.RegisteredNodeIds[i] );
                AssertBrowseNamesEqual( originalBrowseName, registeredBrowseName, "Specified NodeId does not refer to the same node as the registered NodeId." );
            }
            else
            {
                // NodeId does not exist; check if that's allowed
                if( nodesMustExist )
                {
                    var settingInError = findSettings( request.NodesToRegister[i] );
                    addWarning( "Test cannot be completed: NodeId does not exist: " + request.NodesToRegister[i] + "; (Setting: '" + settingInError + "')." );
                    return;
                }
                
                // Allowed to not exist, so compare the requested NodeId to the registered NodeId
                AssertNodeIdsEqual( request.NodesToRegister[i], response.RegisteredNodeIds[i], "Specified NodeId does not match the registered NodeId." );
            }
        }
    }
}