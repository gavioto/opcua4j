/*global UaTranslateBrowsePathsToNodeIdsRequest, addError */

/* Create a default TranslateBrowsePathsToNodeIdsRequest using
   the specified session, startingNodes (array of NodeIds),  
   browseNames (2-d array of QualifiedNames), and referenceTypeIds 
   (2-d array of NodeIds). Returns the request.
*/
function CreateDefaultTranslateBrowsePathsToNodeIdsRequest( session, startingNodes, browseNames, referenceTypeIds )
{
    var i, j;
    
    // ensure startingNodes and browseNames are synchronous (in length)
    if( startingNodes.length !== browseNames.length )
    {
        addError( "CreateDefaultTranslateBrowsePathsToNodeIdsRequest(): startingNodes.length != browseNames.length" );
        return -1;
    }
    
    // ensure browseNames and referenceTypeIds are synchronous (in length)
    if( browseNames.length === referenceTypeIds.length )
    {
        for( i = 0; i < browseNames.length; i++ )
        {
            if( browseNames[i].length !== referenceTypeIds[i].length )
            {
                addError( "CreateDefaultTranslateBrowsePathsToNodeIdsRequest(): browseNames[" + i + "].length != referenceTypeIds[" + i + "].length" );
            }
        }
    }
    else
    {
        addError( "CreateDefaultTranslateBrowsePathsToNodeIdsRequest(): browseNames.length != referenceTypeIds.length" );
        return -1;
    }
    
    var request = new UaTranslateBrowsePathsToNodeIdsRequest();
    session.buildRequestHeader( request.RequestHeader );
    
    for( i = 0; i < startingNodes.length; i++ )
    {
        request.BrowsePaths[i].StartingNode = startingNodes[i];
        for( j = 0; j < browseNames[i].length; j++ )
        {
            // ReferenceTypeId should already be a null NodeId
            request.BrowsePaths[i].RelativePath.Elements[j].IsInverse = false;
            request.BrowsePaths[i].RelativePath.Elements[j].IncludeSubtypes = false;
            request.BrowsePaths[i].RelativePath.Elements[j].TargetName = browseNames[i][j];
            request.BrowsePaths[i].RelativePath.Elements[j].ReferenceTypeId = referenceTypeIds[i][j];
        }
    }
    return request;
}