/*
    Description:
        Validates the RegisterNodes() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js")

// helper to get the browse names
function helperReadBrowseName( NodeId )
{
    var request = new UaReadRequest();
    var response = new UaReadResponse();
    Session.buildRequestHeader( request.RequestHeader );

    request.NodesToRead[0].NodeId = NodeId;
    request.NodesToRead[0].AttributeId = Attribute.BrowseName;

    uaStatus = Session.read( request, response );
    if( !uaStatus.isGood() )
    {
        addError( "Read() status " + uaStatus, uaStatus );
    }
    if( response.Results.length != 1 )
    {
        addError( "Read() returned no results" );
    }
    return response.Results[0].Value;
}

// the service is expected to succeed
// all operations are expected to succeed
function checkRegisterNodesValidParameter( Request, Response )
{
    var bSucceeded = true;
    // check in parameters
    if( arguments.length !== 2 )
    {
        addError( "function checkRegisterNodesValidParameter(): Number of arguments must be 2!" );
        return false;
    }
    // check response header
    bSucceeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader );
    // check results        
    // check number of results
    if( Response.RegisteredNodeIds.length !== Request.NodesToRegister.length )
    {
        addError( "The number of RegisteredNodeIds does not match the number of NodesToRegister." );
        addError( "NodesToRegister.length = " + Request.NodesToRegister.length + "; RegisteredNodeIds.length = " + Response.RegisteredNodeIds.length );
        bSucceeded = false;
    }
    else
    {        
        // check each result
        for( var i=0; i<Response.RegisteredNodeIds.length; i++ )
        {
            var originalBrowseName   = helperReadBrowseName( Request.NodesToRegister[i] );
            var registeredBrowseName = helperReadBrowseName( Response.RegisteredNodeIds[i] );
            if( !originalBrowseName.equals( registeredBrowseName ) )
            {
                addError( "Specified NodeId does not refer to the same node as the returned NodeId." );
            }
        }
    }
    return bSucceeded;
}