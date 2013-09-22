/*global UaBrowseRequest, UaBrowseDescription, BrowseDirection, UaBrowseNextRequest
*/

// Create a default NodeToBrowse for a Browse request
function CreateDefaultBrowseRequestNode( nodeId, directionOverride )
{
    var node = new UaBrowseDescription();
    // referenceTypeId is empty
    node.NodeId = nodeId;
    if( directionOverride !== undefined && directionOverride !== null )
    {
        node.BrowseDirection = directionOverride;
    }
    else
    {
        node.BrowseDirection = BrowseDirection.Forward;
    }
    node.IncludeSubtypes = false;
    node.NodeClassMask = 0;
    node.ResultMask = 0x3F;
    return node;
}


// Create and return a default Browse request (the 
// defaults as specified for the 5.7.1 test cases).
function GetDefaultBrowseRequest( session, nodeId, directionOverride )
{
    var request = new UaBrowseRequest();
    session.buildRequestHeader( request.RequestHeader );
    
    // view is empty, referenceTypeId is empty
    request.RequestedMaxReferencesPerNode = 0;
    request.NodesToBrowse[0] = CreateDefaultBrowseRequestNode( nodeId, directionOverride );

    return request;
}


// Create a NodeToBrowse for a Browse request
// as specified in test case 5.7.1-001.
function CreateTest1BrowseRequestNode( nodeId )
{
    var node = new UaBrowseDescription();
    // referenceTypeId is empty
    node.NodeId = nodeId;
    node.BrowseDirection = BrowseDirection.Both;
    node.IncludeSubtypes = false;
    node.NodeClassMask = 0xFF;
    node.ResultMask = 0x3F;
    return node;
}


// Create and return the Browse request specified
// in 5.7.1-001.
function GetTest1BrowseRequest( session, nodeId )
{
    var request = new UaBrowseRequest();
    session.buildRequestHeader( request.RequestHeader );
    
    // view is empty
    request.RequestedMaxReferencesPerNode = 0;
    request.NodesToBrowse[0] = CreateTest1BrowseRequestNode( nodeId );

    return request;
}


function CreateDefaultBrowseRequests( session, nodesToBrowse )
{
    var request = GetDefaultBrowseRequest( session, nodesToBrowse[0] );
    for( var i = 1; i < nodesToBrowse.length; i++ )
    {
        request.NodesToBrowse[i] = CreateDefaultBrowseRequestNode( nodesToBrowse[i] );
    }
    return request;
}


function CreateTest1BrowseRequests( session, nodesToBrowse )
{
    var request = GetTest1BrowseRequest( session, nodesToBrowse[0] );
    for( var i = 1; i < nodesToBrowse.length; i++ )
    {
        request.NodesToBrowse[i] = CreateTest1BrowseRequestNode( nodesToBrowse[i] );
    }
    return request;
}


function CreateDefaultBrowseNextRequest( session )
{
    var request = new UaBrowseNextRequest();
    session.buildRequestHeader( request.RequestHeader );
    
    // ContinuationPoints is empty
    request.ReleaseContinuationPoints = false;

    return request;
}
