/*global UaNodeId */

// Create an array of NodeIds from a string of format
// "NS0 | IdentifierType | 1 / NS1 | IdentifierType | 2"
function CreateNodeIdsArrayFromString( str )
{
    var nodeIds = str.split( "/" );
    for( var i = 0; i < nodeIds.length; i++ )
    {
        nodeIds[i] = UaNodeId.fromString( nodeIds[i] );
    }
    return nodeIds;
}