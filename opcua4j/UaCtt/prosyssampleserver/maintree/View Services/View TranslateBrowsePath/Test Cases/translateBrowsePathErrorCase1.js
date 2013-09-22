/*  Test prepared by Hannes Mezger hannes.mezger@ascolab.com
    Description:
        Script demonstrates how to use the checkTranslateBrowsePathsToNodeIdsError() function
    Revision History
        04.09.2009 Hannes Mezger: Initial version
*/

var translateBrowsePathRequest  = new UaTranslateBrowsePathsToNodeIdsRequest();
var translateBrowsePathResponse = new UaTranslateBrowsePathsToNodeIdsResponse();
var expectedResults = new Array();

Session.buildRequestHeader( translateBrowsePathRequest.RequestHeader );

translateBrowsePathRequest.BrowsePaths[0].StartingNode = new UaNodeId( 84, 0 );
translateBrowsePathRequest.BrowsePaths[0].RelativePath.Elements[0].ReferenceTypeId = new UaNodeId( Identifier.Organizes, 0 );
translateBrowsePathRequest.BrowsePaths[0].RelativePath.Elements[0].TargetName.Name = "notExisting";
translateBrowsePathRequest.BrowsePaths[0].RelativePath.Elements[0].TargetName.NamespaceIndex = 0;

expectedResults.push( new ExpectedAndAcceptedResults( StatusCode.BadNoMatch ) );

var uaStatus = Session.translateBrowsePathsToNodeIds( translateBrowsePathRequest, translateBrowsePathResponse );

if( uaStatus.isGood() )
{
    checkTranslateBrowsePathsToNodeIdsError( translateBrowsePathRequest, translateBrowsePathResponse, expectedResults );
    
    addLog( "Session.translateBrowsePathsToNodeIds() succeeded" );
}
else
{
    addError( "Session.translateBrowsePathsToNodeIds() failed: " + uaStatus );
}


