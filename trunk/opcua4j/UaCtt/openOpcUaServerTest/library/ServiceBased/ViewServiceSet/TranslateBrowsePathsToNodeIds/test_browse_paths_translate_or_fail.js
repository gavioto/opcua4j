/*globals addError, addLog, addWarning, AssertEqual, BuiltInType, ExpectedAndAcceptedResults,
  g_session, include, MonitoredItem, ReadHelper, StatusCode, TranslateBrowsePathsToNodeIdsHelper,
  TranslateBrowsePathsToNodeIdsValidator
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/translateBrowsePathsToNodeIdsHelper.js" );


function TargetNodeCountIs1Validator()
{
    var returnedNodeId;
    
    // The target count must be one.
    this.assertTrueOnOperationResult = function( result, resultIndex )
    {
        if( result.StatusCode.StatusCode !== StatusCode.BadNoMatch )
        {
            AssertEqual( 1, result.Targets.length, "Response.Results[" + resultIndex + "]: Wrong number of targets returned" );
            returnedNodeId = result.Targets[0].TargetId.NodeId;
            addLog( "Response.Results[" + resultIndex + "]: Returned target NodeId " + returnedNodeId );
        }
    };
}
TargetNodeCountIs1Validator.prototype = new TranslateBrowsePathsToNodeIdsValidator();


/* Call TranslateBrowsePathsToNodeIds and expect either  
   BadNoMatch, or Good with one Target.
   Parameters:
     startingNodes    - the nodes to browse
     browseNames      - the child-nodes/variables/properties to find/translate
     referenceTypeIds - the types of child interested
     verifyTypes      - optional. the data-type of the references expected to be received */
function TestBrowsePathTranslatesOrFails( startingNodes, browseNames, referenceTypeIds, verifyTypes )
{
    var targetNodeValidator = new TargetNodeCountIs1Validator();
    var translate = new TranslateBrowsePathsToNodeIdsHelper();
    var i;
    
    translate.setPathsStartingNodes( startingNodes );
    translate.setPathsTargetNames( browseNames );
    translate.setPathsReferenceTypeIds( referenceTypeIds );
    translate.expectedServiceStatuses = new ExpectedAndAcceptedResults( StatusCode.Good );
    translate.expectOperationError = true;
    for( i = 0; i < startingNodes.length; i++ )
    {
        translate.expectedOperationStatuses[i] = new ExpectedAndAcceptedResults();
        translate.expectedOperationStatuses[i].addExpectedResult( StatusCode.BadNoMatch );
        translate.expectedOperationStatuses[i].addExpectedResult( StatusCode.Good );
    }
    
    if( !translate.validateRequest() ) { return; }
    
    translate.validators[0] = targetNodeValidator;
    translate.executeAndValidate( g_session );
    if( translate.response !== null && verifyTypes !== null && verifyTypes !== undefined )
    {
        // Get the returned targetnodeIds
        var targetNodeIds = translate.getTargetNodeIds();

        // Loop through the results and verify the datatypes
        for ( i = 0; i < targetNodeIds.length; i++ )
        {
            // Read the targetNodeId to retrieve its datatype
            if( targetNodeIds[i] === undefined || targetNodeIds[i] === null )
            {
                addLog( "targetNodeIds[" + i + "] is unavailable." );
                continue;
            }
            var monitoredItem = new MonitoredItem ( targetNodeIds[i][0], 1 );        // [0]: Because only one target node id per result
            if ( ReadHelper.Execute ( monitoredItem ) )
            {
                // Check datatype
                if ( monitoredItem.DataType == verifyTypes [i] )
                {
                    addLog( "The expected and received datatype of property '" + browseNames[i] + "' of nodeId '" + startingNodes[i] + "' is same. (DataType=" + BuiltInType.toString ( verifyTypes [i] ) + ")." );
                }
                else
                {
                    addError( "The expected and received datatype of property '" + browseNames[i] + "' of nodeId '" + startingNodes[i] + "' is different.\n\tExpected DataType=" + BuiltInType.toString ( verifyTypes [i] ) + "\n\tReceived DataType=" + BuiltInType.toString ( monitoredItem.DataType ) );
                }
            }
            else
            {
                addWarning( "Unable to verify datatype of property '" + browseNames[i] + "' of nodeId '" + startingNodes[i] + "'." );
            }
        }
    }
}