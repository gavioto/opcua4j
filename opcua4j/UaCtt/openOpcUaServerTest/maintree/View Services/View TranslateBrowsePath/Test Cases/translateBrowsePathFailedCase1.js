/*  Test prepared by Hannes Mezger hannes.mezger@ascolab.com
    Description:
        Script demonstrates how to use the checkTranslateBrowsePathsToNodeIdsFailed() function
    Revision History
        04.09.2009 Hannes Mezger: Initial version
*/

var translateBrowsePathRequest  = new UaTranslateBrowsePathsToNodeIdsRequest();
var translateBrowsePathResponse = new UaTranslateBrowsePathsToNodeIdsResponse();

Session.buildRequestHeader( translateBrowsePathRequest.RequestHeader );

var uaStatus = Session.translateBrowsePathsToNodeIds( translateBrowsePathRequest, translateBrowsePathResponse );

if( uaStatus.isGood() )
{
    var expectedResult = new ExpectedAndAcceptedResults(StatusCode.BadNothingToDo);
    checkTranslateBrowsePathsToNodeIdsFailed( translateBrowsePathRequest, translateBrowsePathResponse, expectedResult );
    
    addLog( "Session.translateBrowsePathsToNodeIds() succeeded" );
}
else
{
    addError( "Session.translateBrowsePathsToNodeIds() failed: " + uaStatus );
}


