/*globals include, TranslateBrowsePathsToNodeIdsHelper,
  CreateQualifiedNamesArrayFromString, CreateNodeIdsArrayFromString,
  ExpectedAndAcceptedResults, StatusCode
*/


include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/translateBrowsePathsToNodeIdsHelper.js" );


// Get the NodeId of a HasProperty reference off a sourceNodeId.
// propertyName is a QualifiedName in string format (e.g., "0:Definition").
// Returns array of all matching NodeIds.
function getPropertyNodeId( session, sourceNodeId, propertyName )
{
    var translate = new TranslateBrowsePathsToNodeIdsHelper();
    translate.setPathsStartingNodes( [sourceNodeId] );
    translate.setPathsTargetNames( [CreateQualifiedNamesArrayFromString( propertyName )] );
    translate.setPathsReferenceTypeIds( [[new UaNodeId( Identifier.HasProperty ) ]] );//[CreateNodeIdsArrayFromString( "NS0 | IdentifierTypeNumeric | 46" )] );
    translate.expectedServiceStatuses = new ExpectedAndAcceptedResults( StatusCode.Good );
    translate.expectedServiceStatuses.addExpectedResult( StatusCode.BadServiceUnsupported );
    translate.expectOperationError = true;
    translate.expectedOperationStatuses[0] = new ExpectedAndAcceptedResults();
    translate.expectedOperationStatuses[0].addExpectedResult( StatusCode.BadNoMatch );
    translate.expectedOperationStatuses[0].addExpectedResult( StatusCode.Good );
    translate.executeAndValidate( session );
    return translate.getTargetNodeIds()[0];
}