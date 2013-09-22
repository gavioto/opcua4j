/*globals addError, AssertEqual, AssertNotNullNodeId, AssertTrue, BrowseDirection,
  checkTranslateBrowsePathsToNodeIdsError, checkTranslateBrowsePathsToNodeIdsFailed,
  checkTranslateBrowsePathsToNodeIdsValidParameter,
  CreateDefaultTranslateBrowsePathsToNodeIdsRequest, 
  UaTranslateBrowsePathsToNodeIdsResponse
*/


// Base class that recieves calls from TranslateBrowsePathsToNodeIdsHelper
function TranslateBrowsePathsToNodeIdsValidator()
{
    // Called when the service has executed and returned
    this.assertTrueOnServiceResponse = function( response ) { return true; };
    
    // Called for each returned operation result
    this.assertTrueOnOperationResult = function( result, resultIndex ) { };
}


// Class to help call and validate TranslateBrowsePathToNodeIds.
function TranslateBrowsePathsToNodeIdsHelper()
{
    this.startingNodes = []; // 1-d array of NodeIds that will be put into the request
    this.targetNames = []; // 2-d array of UaQualifiedNames. First d is in sync with startingNodes
    this.referenceTypeIds = []; // 2-d array of NodeIds. In sync with targetNames
    this.browseDirections = []; // 2-d array of BrowseDirections. In sync with targetNames but does not have to be completely populated; defaults to Forward
    this.includeSubtypes = []; // 2-d array of bools. In sync with targetNames but does not have to be completely populated: defaults to false
    this.expectServiceError = false;
    this.expectedServiceStatuses = null; // If not null, it is of type ExpectedAndAcceptedResults
    this.expectOperationError = false;
    this.expectedOperationStatuses = []; // Array of ExpectedAndAcceptedResults. In sync with startingNodes.
    this.validators = []; // Array of TranslateBrowsePathsToNodeIdsValidators to perform additional validation after service execution
    this.response = null; // The service response.
    
    // Add a new BrowsePath to the request and set the StartingNode (NodeId). Return the index of the new addition.
    this.addPathStartingNode = function( startingNode )
    {
        var newPathIndex = this.startingNodes.length;
        this.startingNodes[newPathIndex] = startingNode;
        return newPathIndex;
    };

    // Set all the StartingNodes (array of NodeIds) specified; overwrites existing StartingNodes.
    this.setPathsStartingNodes = function( startingNodes )
    {
        this.startingNodes = startingNodes;
    };

    // Set the specified TargetNames (array of UaQualifiedNames) for the request.
    this.setPathTargetNames = function( pathIndex, targetNames )
    {
        this.targetNames[pathIndex] = targetNames;
    };
    
    // Set all the TargetNames (2-d array of UaQualifiedNames) specified; overwrites existing TargetNames.
    this.setPathsTargetNames = function( targetNames )
    {
        this.targetNames = targetNames;
    };

    // Set the specified ReferenceTypeIds (array of NodeIds) for the request.
    this.setPathReferenceTypeIds = function( pathIndex, referenceTypeIds )
    {
        this.referenceTypeIds[pathIndex] = referenceTypeIds;
    };
    
    // Set all the ReferenceTypeIds (2-d array of NodeIds) specified; overwrites existing ReferenceTypeIds.
    this.setPathsReferenceTypeIds = function( referenceTypeIds )
    {
        this.referenceTypeIds = referenceTypeIds;
    };

    // Set the specified BrowseDirection (array of BrowseDirections) for the request.
    this.setPathBrowseDirections = function( pathIndex, browseDirections )
    {
        this.browseDirections[pathIndex] = browseDirections;
    };
    
    // Set the specified IncludeSubtypes (array of bools) for the request.
    this.setPathIncludeSubtypes = function( pathIndex, includeSubtypes )
    {
        this.includeSubtypes[pathIndex] = includeSubtypes;
    };

    // Validate the parameters that will be set in the request. A lot of the scripts
    // pull the parameter values from settings; the validation ensures users aren't
    // configuring their settings to be invalid.
    this.validateRequest = function( expectedPathLength )
    {
        var i, j;
        
        // ensure targetNames and referenceTypeIds arrays equal expectedPathLength
        // (browseDirections and includeSubtypes have default values when not supplied)
        if( expectedPathLength !== undefined )
        {
            for( i = 0; i < this.targetNames.length; i++ )
            {
                if( !AssertEqual( expectedPathLength, this.targetNames[i].length, "Test cannot be completed: wrong number of TargetNames" ) )
                {
                    return false;
                }
                if( !AssertEqual( expectedPathLength, this.referenceTypeIds[i].length, "Test cannot be completed: wrong number of ReferenceTypeIds" ) )
                {
                    return false;
                }
            }
        }

        // ensure no referenceTypeIds are null
        for( i = 0; i < this.referenceTypeIds.length; i++ )
        {
            for( j = 0; j < this.referenceTypeIds[i].length; j++ )
            {
                if( !AssertNotNullNodeId( this.referenceTypeIds[i][j], "Test cannot be completed: referenceTypeIds[" + i + "][" + j + "] is a null NodeId" ) )
                {
                    return false;
                }
            }
        }
        
        return true;
    };
    
    // Call TranslateBrowsePathsToNodeIds and validate the response.
    this.executeAndValidate = function( session )
    {
        var i, j;
        var uaStatus; // service return code
        
        // create request for TranslateBrowsePathsToNodeIds service
        var request = CreateDefaultTranslateBrowsePathsToNodeIdsRequest( session, this.startingNodes, this.targetNames, this.referenceTypeIds );
        if( request == -1 )
        {
            addError( "Test cannot be completed. See previous error encountered while preparing the TranslateBrowsePathsToNodeIds request." );
            return;
        }
        for( i = 0; i < this.browseDirections.length; i++ )
        {
            for( j = 0; j < this.browseDirections[i].length; j++ )
            {
                if( this.browseDirections[i][j] === BrowseDirection.Inverse )
                {
                    request.BrowsePaths[i].RelativePath.Elements[j].IsInverse = this.browseDirections[i][j];
                }
            }
        }
        for( i = 0; i < this.includeSubtypes.length; i++ )
        {
            for( j = 0; j < this.includeSubtypes[i].length; j++ )
            {
                if( this.includeSubtypes[i][j] !== null && this.includeSubtypes[i][j] !== undefined )
                {
                    request.BrowsePaths[i].RelativePath.Elements[j].IncludeSubtypes = this.includeSubtypes[i][j];
                }
            }
        }
        
        this.response = new UaTranslateBrowsePathsToNodeIdsResponse();
        uaStatus = session.translateBrowsePathsToNodeIds( request, this.response );

        // validate call return
        if( uaStatus.isBad() )
        {
            addError( "TranslateBrowsePathsToNodeIds() status " + uaStatus, uaStatus );
            return;
        }
        
        // validate Service result
        if( this.expectServiceError )
        {
            checkTranslateBrowsePathsToNodeIdsFailed( request, this.response, this.expectedServiceStatuses );
            return;
        }
        if( this.expectedServiceStatuses !== null )
        {
            AssertTrue( this.expectedServiceStatuses.containsExpectedStatus( this.response.ResponseHeader.ServiceResult ), "Service status is not expected: " +
            this.response.ResponseHeader.ServiceResult + " instead of " + this.expectedServiceStatuses.ExpectedResults );
        }
        if( !this.validateServiceResponse() ) { return; }
        
        // validate operation results
        if( this.expectOperationError )
        {
            checkTranslateBrowsePathsToNodeIdsError( request, this.response, this.expectedOperationStatuses );
        }
        else
        {
            checkTranslateBrowsePathsToNodeIdsValidParameter( request, this.response );
        }
        this.validateOperationResults();
    };


    // Call validators to check the service response
    this.validateServiceResponse = function()
    {
        var success = 1;
        for( var i = 0; i < this.validators.length; i++ )
        {
            success = success & this.validators[i].assertTrueOnServiceResponse( this.response );
        }
        if( success )
        {
            return true;
        }
        else
        {
            return false;
        }
    };
    
    // Call validators to check an operation result
    this.validateOperationResults = function()
    {
        var i, resultIndex;
        for( resultIndex = 0; resultIndex < this.response.Results.length; resultIndex++ )
        {
            for( i = 0; i < this.validators.length; i++ )
            {
                this.validators[i].assertTrueOnOperationResult( this.response.Results[resultIndex], resultIndex );
            }
        }
    };

    // Get a 2-d array of the target nodes from the response
    this.getTargetNodeIds = function()
    {
        var targetNodeIds = [];
        var i, j;
        if( this.response !== null )
        {
            for ( i = 0; i < this.response.Results.length; i++ )
            {
                for ( j = 0; j < this.response.Results[i].Targets.length; j++ )
                {
                    if ( targetNodeIds[i] == undefined )
                    {
                        targetNodeIds[i] = [];
                    }
                    
                    targetNodeIds[i][j] = this.response.Results[i].Targets[j].TargetId.NodeId;
                }            
            }
        }
        return targetNodeIds;        
    };
}