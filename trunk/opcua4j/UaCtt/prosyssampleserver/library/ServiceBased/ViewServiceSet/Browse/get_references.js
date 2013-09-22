/*global include, StatusCode, addWarning, UaBrowseNextRequest,
  Session, UaBrowseNextResponse, AssertBasicBrowseServiceSuccess,
  addLog, addError, UaBrowseResponse, AssertBasicBrowseSuccess,
  GetTest1BrowseRequest, GetDefaultBrowseRequest, 
  CreateDefaultBrowseRequests, AddUniqueNodeIdToArray,
  BrowseDirection, UaNodeId, NodeClass
*/


include( "./library/ServiceBased/ViewServiceSet/Browse/get_default_request.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/assert_browse_valid.js" );


// Browse for more references (if there are more).
// Returns browse response if it browsed; otherwise, null.
function BrowseForMore( response )
{
    var continuationPoints = [];
    var browseAgain = false;
    
    // Collect the ContinuationPoints (null or otherwise)
    var i;
    for( i = 0; i < response.Results.length; i++ )
    {
        if( !response.Results[i].ContinuationPoint.isEmpty() )
        {
            if( response.Results[i].StatusCode.StatusCode !== StatusCode.Good )
            {
                addWarning( "ContinuationPoint is not empty but StatusCode is not Good: " + response.Results[i].StatusCode );
            }
            browseAgain = true;
        }
        continuationPoints[i] = response.Results[i].ContinuationPoint;
    }

    // Browse for more
    if( browseAgain )
    {
        var request = new UaBrowseNextRequest();
        Session.buildRequestHeader( request.RequestHeader );
        request.ReleaseContinuationPoints = false;
        for( i = 0; i < continuationPoints.length; i++ )
        {
            request.ContinuationPoints[i] = continuationPoints[i];
        }

        response = new UaBrowseNextResponse();
        
        var uaStatus = Session.browseNext( request, response );
        if( AssertBasicBrowseServiceSuccess( uaStatus, response, request.ContinuationPoints.length ) )
        {
            for( i=0; i < response.Results.length; i++ )
            {
                if( !response.Results[i].StatusCode.isGood() )
                {
                    if( response.Results[i].StatusCode.StatusCode == StatusCode.BadNoContinuationPoints )
                    {
                        addLog( "Server did not allocate continuation point." );
                        return null;
                    }
                    else
                    {
                        addError( "Unexpected operation error: will not continue browsing: " + response.Results[i].StatusCode );
                        return null;
                    }
                }
            }
        }
        else
        {
            addError( "Browse() status " + uaStatus, uaStatus );
            return null;
        }
        return response;
    }
    return null;
}


/* Browse for all references using the given request.
   expectedOperationResults is an array of ExpectedAndAcceptedResults
   objects. If expectedOperationResults is not provided, the 
   operation status codes are expected to be isGood().
   Returns a 2-d array of references. The 2-d array is empty
   if the Browse fails.
*/
function GetReferencesFromRequest( session, request, expectedOperationResults )
{
    var response = new UaBrowseResponse();

    var uaStatus = session.browse( request, response );
    
    var references = [];
    var i;
    for( i = 0; i < request.NodesToBrowse.length; i++ )
    {
        references[i] = [];
    }
    
    // check result
    if( !AssertBasicBrowseSuccess( uaStatus, response, request, expectedOperationResults ) )
    {
        return references;
    }

    // Collect all the references.
    // BrowseNext as necessary.
    do
    {
        // Collect the types of references returned.
        for( var r = 0; r < response.Results.length; r++ )
        {
            var returnedReferences = response.Results[r].References;
            for( i = 0; i < returnedReferences.length; i++ )
            {
                references[r].push( returnedReferences[i] );
            }
        }
        response = BrowseForMore( response );
    } while ( response !== null );

    return references;
}


// Browse for all references as per test case 5.7.1-1. Return an
// empty array or an array containing all of the references.
function GetTest1ReferencesFromNodeId( session, nodeId, expectedOperationResult )
{
    var expectedOperationResults;
    if( expectedOperationResult !== undefined )
    {
        expectedOperationResults = [1];
        expectedOperationResults[0] = expectedOperationResult;
    }
    var references = GetReferencesFromRequest( session, GetTest1BrowseRequest( session, nodeId ), expectedOperationResults );
    return references[0];
}


// Browse for all references as per the test case default. Return
// an empty array or an array containing all of the references.
function GetDefaultReferencesFromNodeId( session, nodeId, expectedOperationResult, directionOverride )
{
    var expectedOperationResults;
    if( expectedOperationResult !== undefined )
    {
        expectedOperationResults = [1];
        expectedOperationResults[0] = expectedOperationResult;
    }
    var references = GetReferencesFromRequest( session, GetDefaultBrowseRequest( session, nodeId, directionOverride ), expectedOperationResults );
    return references[0];
}


// Browse for all references as per the test case default. Return
// an empty array or a 2-d array containing all of the references.
function GetDefaultReferencesFromNodeIds( session, nodeIds, expectedOperationResults )
{
    return GetReferencesFromRequest( session, CreateDefaultBrowseRequests( Session, nodeIds ), expectedOperationResults );
}


// Browse for all references and validate that at least two different types of
// references exist on the node. Return an empty array or an array containing all
// of the references.
function GetReferencesAndCountTypes( nodeId, referenceTypes )
{
    var request = GetTest1BrowseRequest( Session, nodeId );
    var response = new UaBrowseResponse();

    var uaStatus = Session.browse( request, response );
    
    var references = [];
    
    // check result
    if( !AssertBasicBrowseSuccess( uaStatus, response, request ) )
    {
        return references;
    }

    // Collect all the references, and each unique ReferenceTypeId.
    // BrowseNext as necessary.
    do
    {
        // Collect the types of references returned; store each unique ReferenceTypeId.
        var returnedReferences = response.Results[0].References;
        for( var i = 0; i < returnedReferences.length; i++ )
        {
            references.push( returnedReferences[i] );

            AddUniqueNodeIdToArray( referenceTypes, returnedReferences[i].ReferenceTypeId );
        }
        response = BrowseForMore( response );
    } while ( response !== null );

    if( referenceTypes.length < 2 )
    {
        addError( "Test cannot be completed: node's references consist of less than two types." );
        return [];
    }

    return references;
}


// Return the first (only?) parent type of a specified reference type.
function GetReferenceTypeFirstParent( nodeId )
{
    var request = GetDefaultBrowseRequest( Session, nodeId );
    var response = new UaBrowseResponse();
    
    request.NodesToBrowse[0].BrowseDirection = BrowseDirection.Inverse;
    
    var uaStatus = Session.browse( request, response );
    
    // check result
    if( !AssertBasicBrowseSuccess( uaStatus, response, request ) )
    {
        return "";
    }

    return response.Results[0].References[0].NodeId.NodeId;
}


// Browse for all references and validate that at least two different types of
// parent references exist on the node. Return an empty array or an array 
// containing all of the references.
function GetReferencesAndCountParentTypes( nodeId )
{
    var referenceTypes = [];
    var references = GetReferencesAndCountTypes( nodeId, referenceTypes );
    if( referenceTypes.length < 2 )
    {
        addError( "Test cannot be completed: node's references consist of less than two types." );
        return [];
    }
    
    // Collect the reference types' parent types; store each unique parent TypeId.
    var parentTypes = [];
    for( var i = 0; i < referenceTypes.length; i++ )
    {
        var parentType = GetReferenceTypeFirstParent( referenceTypes[i] );
        if( parentType != "" )
        {
            AddUniqueNodeIdToArray( parentTypes, parentType );
        }
    }
    
    if( parentTypes.length < 2 )
    {
        addError( "Test cannot be completed: node's references have less than two unique parent types." );
    }

    return references;
}


// Return all the subtypes (the Ids) of a specified referenceTypeId.
function GetReferenceTypeSubtypes( referenceTypeId )
{
    var request = GetDefaultBrowseRequest( Session, referenceTypeId );
    var response = new UaBrowseResponse();

    request.NodesToBrowse[0].BrowseDirection = BrowseDirection.Forward;
    
    var uaStatus = Session.browse( request, response );
    
    // check result
    if( !AssertBasicBrowseSuccess( uaStatus, response, request ) )
    {
        return [];
    }
    
    // get immediate subtypes
    var subtypes = [];
    var i;
    for( i = 0; i < response.Results[0].References.length; i++)
    {
        subtypes.push( response.Results[0].References[i].NodeId.NodeId );
    }

    // get subtype's subtypes
    var originalLength = subtypes.length;
    for( i = 0; i < originalLength; i++)
    {
        subtypes = subtypes.concat( GetReferenceTypeSubtypes( subtypes[i] ) );
    }

    return subtypes;
}


// From a given array, find all the references matching the given referenceTypeId.
// Returns the array of matching references.
function GetReferencesOfType( allReferences, referenceTypeId )
{
    var expectedReferences = [];
    for( var i = 0; i < allReferences.length; i++ )
    {
        if( allReferences[i].ReferenceTypeId.equals( referenceTypeId ) )
        {
            expectedReferences.push( allReferences[i] );
        }
    }
    return expectedReferences;
}


// From a given array, find all the references matching any of the given referenceTypeIds.
// Returns the array of matching references.
function GetReferencesOfTypes( allReferences, referenceTypeIds )
{
    var expectedReferences = [];
    for( var i = 0; i < allReferences.length; i++ )
    {
        for( var n = 0; n < referenceTypeIds.length; n++ )
        {
            if( allReferences[i].ReferenceTypeId.equals( referenceTypeIds[n] ) )
            {
                expectedReferences.push( allReferences[i] );
                break;
            }
        }
    }
    return expectedReferences;
}


// Recursively browse forward through nodes to find Views.
// Returns true if a View is found.
function NodeHasViewsRecursive( session, nodeToBrowse, browsedNodes )
{
    var references = GetDefaultReferencesFromNodeId( session, nodeToBrowse );
    var i;
    for( i = 0; i < references.length; i++ )
    {
        if( references[i].NodeClass == NodeClass.View )
        {
            return true;
        }
    }
    
    /* We didn't find a View, so lets browse into the Forward nodes.
       Because the model is not hierarchal, we could end up browsing
       in an infinite circle and cause a stack overflow. To prevent
       that, track the nodes that have already been browsed (and
       don't rebrowse).
    */
    browsedNodes.push( nodeToBrowse );
    for( i = 0; i < references.length; i++ )
    {
        var alreadyBrowsed = false;
        for( var j = 0; j < browsedNodes.length; j++ )
        {
            if( browsedNodes[j].equals( references[i].NodeId.NodeId ) )
            {
                alreadyBrowsed = true;
                break;
            }
        }
        if( !alreadyBrowsed )
        {
            if( NodeHasViewsRecursive( session, references[i].NodeId.NodeId, browsedNodes ) )
            {
                return true;
            }
        }
    }
    
    return false;
}


// Return true if the function has Views (under /Views); otherwise, false.
function ServerHasViews( session )
{
    return NodeHasViewsRecursive( session, new UaNodeId( Identifier.ViewsFolder, 0 ), [] );
}


// Return the response from a call to Browse requesting one reference of a node.
function GetBrowseResponseForOneReference( session, nodesToBrowse, expectedOperationResults )
{
    var request = CreateDefaultBrowseRequests( session, nodesToBrowse );
    var response = new UaBrowseResponse();
    
    request.RequestedMaxReferencesPerNode = 1;
    
    var uaStatus = session.browse( request, response );

    if( !AssertBasicBrowseSuccess( uaStatus, response, request, expectedOperationResults ) )
    {
        addError( "Test cannot be completed: Browse failed" );
        return -1;
    }
    
    return response;
}
