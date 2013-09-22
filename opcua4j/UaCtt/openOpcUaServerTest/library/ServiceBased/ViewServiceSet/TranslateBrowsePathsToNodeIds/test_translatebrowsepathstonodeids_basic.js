/*global addError, addLog, AssertEqual, AssertNodeIdsEqual, AssertNotNullOrEmpty,
  BrowseDirection, GetDefaultReferencesFromNodeId, GetTest1ReferencesFromNodeId, 
  include, print, readSetting, Session, TranslateBrowsePathsToNodeIdsHelper,
  TranslateBrowsePathsToNodeIdsValidator, UaNodeId
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/get_references.js" );


// Class to validate that TranslateBrowsePathsToNodeIds returns the expected target nodes.
function TargetNodeComparer()
{
    this.expectedTargetNodes = [];
    
    // Ensure all expectedTargetNodes are valid NodeIds
    this.validateTargetNodes = function()
    {
        var i, j;
        
        for( i = 0; i < this.expectedTargetNodes.length; i++ )
        {
            for( j = 0; j < this.expectedTargetNodes[i].length; j++ )
            {
                if( this.expectedTargetNodes[i][j] === null || this.expectedTargetNodes[i][j] === undefined || this.expectedTargetNodes[i][j].equals( new UaNodeId() ) )
                {
                    addError( "Test cannot be completed: target node is a null NodeId" );
                    return false;
                }
            }
        }
        return true;
    };
    
    this.assertTrueOnServiceResponse = function( response )
    {
        if( response.Results.length === 0 )
        {
            if( this.expectedTargetNodes.length === 1 )
            {
                addWarning( "Results returned were 0. This may be the result of a lack of support for a particular feature. Investigate further." );
                return( false );
            }
        }
        return AssertEqual( this.expectedTargetNodes.length, response.Results.length, "Wrong number of Results returned" );
    };
    
    // Target nodes in response must match expected target nodes.
    this.assertTrueOnOperationResult = function( result, resultIndex )
    {
        var j;
        
        if( AssertEqual( this.expectedTargetNodes[resultIndex].length, result.Targets.length, "Wrong number of Targets returned." ) )
        {
            for( j = 0; j < this.expectedTargetNodes[resultIndex].length; j++ )
            {
                AssertNodeIdsEqual( this.expectedTargetNodes[resultIndex][j], result.Targets[j].TargetId.NodeId, "Results[" + resultIndex + "].TargetId[" + j + "] is not as expected" );
                AssertEqual( Math.pow( 2, 32 ) - 1, result.Targets[j].RemainingPathIndex, "Results[" + resultIndex + "].RemainingPathIndex is not as expected" );
            }
        }
    };
}
TargetNodeComparer.prototype = new TranslateBrowsePathsToNodeIdsValidator();


// Storage for info needed to perform TranslateBrowsePathsToNodeIds
function BrowsePathInfo()
{
    this.browseNames = [];
    this.referenceTypeIds = [];
    this.targetNodeId = null;
    
    this.addLog = function( startingNodeSetting, startingNodeId )
    {
        var i;
        addLog( "Translate browse path from " + startingNodeSetting + " (" + startingNodeId + ")" );
        for( i = 0; i < this.browseNames.length; i++ )
        {
            addLog( "  To " + this.browseNames[i].NamespaceIndex + ":" + this.browseNames[i].Name + " of reference type " + this.referenceTypeIds[i] );
        }
        addLog( "  Expecting targetNodeId " + this.targetNodeId );
    };
}


// Recursively browse nodes until the specified depth has been reached.
// nodeToBrowse is the nodeId at which to start browsing
// direction is the BrowseDirection 
// browsedNodes is an array of nodes that have been browsed. If null, circular browsing is allowed.
// Returns null if the depth could not be reached; otherwise, returns an instance of BrowsePathInfo
function BrowseToDepth( nodeToBrowse, direction, depth, browsedNodes )
{
    var references;  // references returned from Browse call
    var browsePathToTest;  // instance of BrowsePathInfo to store required info
    var i;

    if( nodeToBrowse === undefined || nodeToBrowse === null || nodeToBrowse === "" )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Please check the settings are configured for Browse testing." );
        return( null );
    }

    print( "Depth " + depth + ": browsing " + nodeToBrowse );

    // browse node and get references
    if( direction === BrowseDirection.Both )
    {
        references = GetTest1ReferencesFromNodeId( Session, nodeToBrowse );
    }
    else
    {
        references = GetDefaultReferencesFromNodeId( Session, nodeToBrowse, undefined, direction );
    }
    
    // if we've reached required depth, pick a reference to be the targetNodeId and return
    if( depth === 1 && references.length > 0 )
    {
        browsePathToTest = new BrowsePathInfo();
        browsePathToTest.browseNames.push( references[0].BrowseName );
        browsePathToTest.referenceTypeIds.push( references[0].ReferenceTypeId );
        browsePathToTest.targetNodeId = references[0].NodeId.NodeId;
        return browsePathToTest;
    }
    
    // browse each reference until one of them leads down a path that can reach the required depth
    for( i = 0; i < references.length; i++ )
    {
        if( browsedNodes !== null )
        {
            // skip nodes we've already followed (i.e., no circular browsing)
            var found = false;
            for( var j = 0; j < browsedNodes.length; j++ )
            {
                if( references[i].NodeId.NodeId.equals( browsedNodes[j] ) )
                {
                    found = true;
                    break;
                }
            }
            if( !found )
            {
                browsedNodes.push( references[i].NodeId.NodeId );
            }
            else
            {
                continue;
            }
        }
        
        browsePathToTest = BrowseToDepth( references[i].NodeId.NodeId, direction, depth - 1, browsedNodes );
        if( browsePathToTest !== null )
        {
            browsePathToTest.browseNames.unshift( references[i].BrowseName );
            browsePathToTest.referenceTypeIds.unshift( references[i].ReferenceTypeId );
            return browsePathToTest;
        }
    }
    print( "  Cannot go deeper" );
    return null;
}


// Test TranslateBrowsePathsToNodeIds in a default, good way
//function TestTranslateBrowsePathsToNodeIdsBasic( startingNode, browseNames, referenceTypeIds, targetNode, pathLength )
function TestTranslateBrowsePathsToNodeIdsBasic( startingNodeSetting, pathLength )
{
    var startingNodeId = UaNodeId.fromString( readSetting( startingNodeSetting ).toString() );
    if( startingNodeId === undefined || startingNodeId === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Please check setting '" + startingNodeSetting + "'." );
        return;
    }
    
    // use Browse to find browseNames, referenceTypeIds, and targetNode
    var pathToBrowse = BrowseToDepth( startingNodeId, BrowseDirection.Forward, pathLength, [] );
    if( !AssertNotNullOrEmpty( pathToBrowse, "Test cannot be completed: could not browse any references from StartingNode " + startingNodeSetting ) )
    {
        return;
    }
    AssertEqual( pathLength, pathToBrowse.browseNames.length, "Test cannot be completed: could not create a TranslateBrowsePathsToNodeIds test of the required length from StartingNode " + startingNodeSetting );
    
    pathToBrowse.addLog( startingNodeSetting, startingNodeId );
    var browseNames = pathToBrowse.browseNames;
    var referenceTypeIds = pathToBrowse.referenceTypeIds;
    var targetNode = pathToBrowse.targetNodeId;
    
    // create TargetNodeComparer to validate that translateBrowsePathsToNodeIds
    // resolves to the correct target NodeId
    var targetNodeValidator = new TargetNodeComparer();
    targetNodeValidator.expectedTargetNodes[0] = [ targetNode ];
    if( !targetNodeValidator.validateTargetNodes() ) { return; }

    var translate = new TranslateBrowsePathsToNodeIdsHelper();
    var pathIndex = translate.addPathStartingNode( startingNodeId );
    translate.setPathTargetNames( pathIndex, browseNames );
    translate.setPathReferenceTypeIds( pathIndex, referenceTypeIds );
    if( !translate.validateRequest( pathLength ) ) { return; }
    
    translate.validators[0] = targetNodeValidator;
    translate.executeAndValidate( Session );
}


// Test TranslateBrowsePathsToNodeIds with a null NodeId in ReferenceTypeIds
function TestTranslateBrowsePathsToNodeIdsNullReferenceTypeId( startingNode, browseNames, referenceTypeIds, targetNode, pathLength )
{
    if( startingNode === undefined || startingNode === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Please check setting '" + startingNodeSetting + "'." );
        return;
    }

    // create TargetNodeComparer to validate that translateBrowsePathsToNodeIds 
    // resolves to the correct target NodeId
    var targetNodeValidator = new TargetNodeComparer();
    targetNodeValidator.expectedTargetNodes[0] = [ targetNode ];
    if( !targetNodeValidator.validateTargetNodes() ) { return; }

    var translate = new TranslateBrowsePathsToNodeIdsHelper();
    var pathIndex = translate.addPathStartingNode( startingNode );
    translate.setPathTargetNames( pathIndex, browseNames );
    translate.setPathReferenceTypeIds( pathIndex, referenceTypeIds );

    var includeSubtypes = [];
    for( var i = 0; i < browseNames.length; i++ )
    {
        includeSubtypes[i] = true;
    }
    translate.setPathIncludeSubtypes( pathIndex, includeSubtypes );

    translate.validators[0] = targetNodeValidator;
    translate.executeAndValidate( Session );
}


// Test TranslateBrowsePathsToNodeIds in the Inverse direction
function TestTranslateBrowsePathsToNodeIdsInverse( startingNodeSetting, pathLength )
{
    var startingNodeId = UaNodeId.fromString( readSetting( startingNodeSetting ).toString() );
    if( startingNodeId === undefined || startingNodeId === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Please check setting '" + startingNodeSetting + "'." );
        return;
    }

    // use Browse to find browseNames, referenceTypeIds, and targetNode
    // inverse references are optional, so take that into consideration
    var pathToBrowse = BrowseToDepth( startingNodeId, BrowseDirection.Inverse, pathLength, [] );
    if( pathToBrowse === null )
    {
        _warning.store( "Inverse references not found. Perhaps not supported?" );
        _notSupported.store( "InverseReferences" );
        return;
    }
    if( !AssertNotNullOrEmpty( pathToBrowse, "Test cannot be completed: could not browse any references from StartingNode " + startingNodeSetting ) )
    {
        return;
    }
    AssertEqual( pathLength, pathToBrowse.browseNames.length, "Test cannot be completed: could not create a TranslateBrowsePathsToNodeIds test of the required length from StartingNode " + startingNodeSetting );
    
    pathToBrowse.addLog( startingNodeSetting, startingNodeId );
    var browseNames = pathToBrowse.browseNames;
    var referenceTypeIds = pathToBrowse.referenceTypeIds;
    var targetNode = pathToBrowse.targetNodeId;
    
    // create TargetNodeComparer to validate that translateBrowsePathsToNodeIds 
    // resolves to the correct target NodeId
    var targetNodeValidator = new TargetNodeComparer();
    targetNodeValidator.expectedTargetNodes[0] = [ targetNode ];
    if( !targetNodeValidator.validateTargetNodes() ) { return; }

    var translate = new TranslateBrowsePathsToNodeIdsHelper();
    var pathIndex = translate.addPathStartingNode( startingNodeId );
    translate.setPathTargetNames( pathIndex, browseNames );
    translate.setPathReferenceTypeIds( pathIndex, referenceTypeIds );
    translate.setPathBrowseDirections( pathIndex, [ BrowseDirection.Inverse ] );
    if( !translate.validateRequest( pathLength ) ) { return; }
    
    translate.validators[0] = targetNodeValidator;
    translate.executeAndValidate( Session );
}


// Test TranslateBrowsePathsToNodeIds in the Inverse direction
function TestTranslateBrowsePathsToNodeIdsIncludeSubtypes( startingNode, browseNames, referenceTypeIds, targetNode, pathLength )
{
    if( startingNode === undefined || startingNode === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Please check setting '" + startingNodeSetting + "'." );
        return;
    }

    // create TargetNodeComparer to validate that translateBrowsePathsToNodeIds 
    // resolves to the correct target NodeId
    var targetNodeValidator = new TargetNodeComparer();
    targetNodeValidator.expectedTargetNodes[0] = [ targetNode ];
    if( !targetNodeValidator.validateTargetNodes() ) { return; }

    var translate = new TranslateBrowsePathsToNodeIdsHelper();
    var pathIndex = translate.addPathStartingNode( startingNode );
    translate.setPathTargetNames( pathIndex, browseNames );
    translate.setPathReferenceTypeIds( pathIndex, referenceTypeIds );
    
    var includeSubtypes = [];
    for( var i = 0; i < browseNames.length; i++ )
    {
        includeSubtypes[i] = true;
    }
    translate.setPathIncludeSubtypes( pathIndex, includeSubtypes );
    
    if( !translate.validateRequest( pathLength ) ) { return; }
    
    translate.validators[0] = targetNodeValidator;
    translate.executeAndValidate( Session );
}


// Test TranslateBrowsePathsToNodeIds in a default way with multiple BrowsePaths
function TestTranslateBrowsePathsToNodeIdsMulti( startingNodes, browseNames, referenceTypeIds, targetNodes )
{
    // create TargetNodeComparer to validate that translateBrowsePathsToNodeIds 
    // resolves to the correct target NodeId
    var targetNodeValidator = new TargetNodeComparer();
    targetNodeValidator.expectedTargetNodes = targetNodes;
    if( !targetNodeValidator.validateTargetNodes() ) { return; }

    var translate = new TranslateBrowsePathsToNodeIdsHelper();
    translate.setPathsStartingNodes( startingNodes );
    translate.setPathsTargetNames( browseNames );
    translate.setPathsReferenceTypeIds( referenceTypeIds );
    if( !translate.validateRequest() ) { return; }
    
    translate.validators[0] = targetNodeValidator;
    translate.executeAndValidate( Session );
}