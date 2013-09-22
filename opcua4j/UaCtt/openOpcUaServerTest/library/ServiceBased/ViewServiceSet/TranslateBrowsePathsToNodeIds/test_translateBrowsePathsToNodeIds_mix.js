/*global UaNodeId, addError, UaTranslateBrowsePathsToNodeIdsResponse,
  Session, checkTranslateBrowsePathsToNodeIdsError, AssertEqual,
  AssertNodeIdsEqual, AssertNotNullNodeId, 
  CreateDefaultTranslateBrowsePathsToNodeIdsRequest
*/


// Test TranslateBrowsePathsToNodeIds using the specified
// request and expecting a Good or Bad result.
function TestTranslateBrowsePathsToNodeIdsMixFromRequest( request, targetNodes, expectedOperationResults )
{
    var i, j;
    
    // call service
    var response = new UaTranslateBrowsePathsToNodeIdsResponse();
    var uaStatus = Session.translateBrowsePathsToNodeIds( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        checkTranslateBrowsePathsToNodeIdsError( request, response, expectedOperationResults );

        if( AssertEqual( targetNodes.length, response.Results.length, "Wrong number of Results returned" ) )
        {
            for( i = 0; i < response.Results.length; i++ )
            {
                var result = response.Results[i];
                
                if( AssertEqual( targetNodes[i].length, result.Targets.length, "Wrong number of Targets returned." ) )
                {
                    for( j = 0; j < targetNodes[i].length; j++ )
                    {
                        AssertNodeIdsEqual( targetNodes[i][j], result.Targets[j].TargetId.NodeId, "Results[" + i + "].TargetId[" + j + "] is not as expected" );
                        AssertEqual( Math.pow( 2, 32 ) - 1, result.Targets[j].RemainingPathIndex, "Results[" + i + "].RemainingPathIndex is not as expected" );
                    }
                }
            }
        }
    }
    else
    {
        addError( "TranslateBrowsePathsToNodeIds() status " + uaStatus, uaStatus );
    }
}


// Test TranslateBrowsePathsToNodeIds in a default way with multiple BrowsePaths
// expecting different operation level statuses
//function TestTranslateBrowsePathsToNodeIdsMultiMix( startingNodes, browseNames, referenceTypeIds, targetNodes, expectedOperationResults, suppressNullTypeCheck )
function TestTranslateBrowsePathsToNodeIdsMultiMix( startingNodes, pathsToBrowse, expectedOperationResults, suppressNullTypeCheck )
{
    var i;
    
    if( suppressNullTypeCheck === undefined )
    {
        suppressNullTypeCheck = false;
    }
    
    // convert pathsToBrowse to older style
    var browseNames = [];
    var referenceTypeIds = [];
    var targetNodeIds = [];
    for( i = 0; i < pathsToBrowse.length; i++ )
    {
        browseNames[i] = pathsToBrowse[i].browseNames;
        referenceTypeIds[i] = pathsToBrowse[i].referenceTypeIds;
        targetNodeIds[i] = pathsToBrowse[i].targetNodeId;
    }
    
    // referenceTypeIds cannot be null NodeIds
    if( !suppressNullTypeCheck )
    {
        for( i = 0; i < referenceTypeIds.length; i++ )
        {
            for( var j = 0; j < referenceTypeIds[i].length; j++ )
            {
                if( !AssertNotNullNodeId( referenceTypeIds[i][j], "Test cannot be compelted: referenceTypeIds[" + i + "][" + j + "] is a null NodeId" ) )
                {
                    return;
                }
            }
        }
    }
    
    var request = CreateDefaultTranslateBrowsePathsToNodeIdsRequest( Session, startingNodes, browseNames, referenceTypeIds );
    if( request == -1 )
    {
        addError( "Test cannot be completed" );
        return;
    }
    
    TestTranslateBrowsePathsToNodeIdsMixFromRequest( request, targetNodeIds, expectedOperationResults );
}


// Test TranslateBrowsePathsToNodeIds in a default way with multiple BrowsePaths
// expecting different operation level statuses. Some RelativePath elements are
// IsInverse = true.
//function TestTranslateBrowsePathsToNodeIdsInverseMultiMix( startingNodes, browseNames, referenceTypeIds, targetNodes, expectedOperationResults, suppressNullTypeCheck )
function TestTranslateBrowsePathsToNodeIdsInverseMultiMix( startingNodes, pathsToBrowse, expectedOperationResults, suppressNullTypeCheck )
{
    if( suppressNullTypeCheck === undefined )
    {
        suppressNullTypeCheck = false;
    }
    
    // convert pathsToBrowse to older style
    var browseNames = [];
    var referenceTypeIds = [];
    var targetNodeIds = [];
    var i;
    for( i = 0; i < pathsToBrowse.length; i++ )
    {
        browseNames[i] = pathsToBrowse[i].browseNames;
        referenceTypeIds[i] = pathsToBrowse[i].referenceTypeIds;
        targetNodeIds[i] = pathsToBrowse[i].targetNodeId;
    }
    
    // referenceTypeIds cannot be null NodeIds
    if( !suppressNullTypeCheck )
    {
        for( i = 0; i < referenceTypeIds.length; i++ )
        {
            for( var j = 0; j < referenceTypeIds[i].length; j++ )
            {
                if( !AssertNotNullNodeId( referenceTypeIds[i][j], "Test cannot be compelted: referenceTypeIds[" + i + "][" + j + "] is a null NodeId" ) )
                {
                    return;
                }
            }
        }
    }

    var request = CreateDefaultTranslateBrowsePathsToNodeIdsRequest( Session, startingNodes, browseNames, referenceTypeIds );
    if( request == -1 )
    {
        addError( "Test cannot be completed" );
        return;
    }

    for( i = 0; i < request.BrowsePaths.length; i++ )
    {
        var index = Math.round( request.BrowsePaths[i].RelativePath.Elements.length * i / request.BrowsePaths.length );
        request.BrowsePaths[i].RelativePath.Elements[index].IsInverse = true;
    }

    TestTranslateBrowsePathsToNodeIdsMixFromRequest( request, targetNodeIds, expectedOperationResults );
}