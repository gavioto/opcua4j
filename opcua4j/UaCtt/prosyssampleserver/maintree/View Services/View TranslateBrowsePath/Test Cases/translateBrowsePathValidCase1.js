/*  Test prepared by Hannes Mezger hannes.mezger@ascolab.com
    Description:
        Script demonstrates how to use the checkTranslateBrowsePathsToNodeIdsValidParameter() function
    Revision History
        04.09.2009 Hannes Mezger: Initial version
*/

var translateBrowsePathRequest  = new UaTranslateBrowsePathsToNodeIdsRequest();
var translateBrowsePathResponse = new UaTranslateBrowsePathsToNodeIdsResponse();

Session.buildRequestHeader( translateBrowsePathRequest.RequestHeader );

translateBrowsePathRequest.BrowsePaths[0].StartingNode = new UaNodeId( 84, 0 );
translateBrowsePathRequest.BrowsePaths[0].RelativePath.Elements[0].ReferenceTypeId = new UaNodeId( Identifier.Organizes, 0 );
translateBrowsePathRequest.BrowsePaths[0].RelativePath.Elements[0].TargetName.Name = "Objects";
translateBrowsePathRequest.BrowsePaths[0].RelativePath.Elements[0].TargetName.NamespaceIndex = 0;

var uaStatus = Session.translateBrowsePathsToNodeIds( translateBrowsePathRequest, translateBrowsePathResponse );

if( uaStatus.isGood() )
{
    checkTranslateBrowsePathsToNodeIdsValidParameter( translateBrowsePathRequest, translateBrowsePathResponse );
    
    addLog( "Session.translateBrowsePathsToNodeIds() succeeded" );
}
else
{
    addError( "Session.translateBrowsePathsToNodeIds() failed: " + uaStatus );
}


