/*
    Description:
        Validates the UnRegisterNodes() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

/*global include, UaReadRequest, UaReadResponse, Session, Attribute,
  addError, StatusCode, checkResponseHeaderValid
*/

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );


function ReadBrowseNameOfUnregisteredNode( nodeId )
{
    var request = new UaReadRequest();
    var response = new UaReadResponse();
    Session.buildRequestHeader( request.RequestHeader );

    request.NodesToRead[0].NodeId = nodeId;
    request.NodesToRead[0].AttributeId = Attribute.BrowseName;

    var uaStatus = Session.read( request, response );
    if( !uaStatus.isGood() )
    {
        addError( "Read() status " + uaStatus, uaStatus );
    }
    else if( !response.ResponseHeader.ServiceResult.isGood() )
    {
        addError( "Read of unregistered NodeId Service Result is not good: " + response.ResponseHeader.ServiceResult, response.ResponseHeader.ServiceResult );
    }
    // check if item result is BadNodeIdUnknown
    else if( StatusCode.BadNodeIdUnknown !== response.Results[0].StatusCode.StatusCode )
    {
        addError( "Read of unregistered NodeId return wrong Result[0].StatusCode: " + response.Results[0].StatusCode, response.Results[0].StatusCode );
    }
}

// the service is expected to succeed
// all operations are expected to succeed
function checkUnregisterNodesValidParameter( request, response, originalNodeIds )
{
    var succeeded = true;
    // check in parameters
    if( arguments.length !== checkUnregisterNodesValidParameter.length )
    {
        addError( "function checkUnregisterNodesValidParameter(): Number of arguments must be " + checkUnregisterNodesValidParameter.length );
        return false;
    }
    // check response header
    succeeded = checkResponseHeaderValid( request.RequestHeader, response.ResponseHeader, StatusCode.Good );
    // If a registered NodeId differs from the original, try reading the BrowseName
    // using the now unregistered NodeId; the read should fail.
    for( var i=0; i<request.NodesToUnregister.length; i++ )
    {
        if( !request.NodesToUnregister[i].equals( originalNodeIds[i] ) )
        {
            ReadBrowseNameOfUnregisteredNode( request.NodesToUnregister[i] );
        }
    }
    return succeeded;
}