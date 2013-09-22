/*  Test prepared by Hannes Mezger hannes.mezger@ascolab.com
    Description:
        Script demonstrates how to use the checkUnregisterNodesFailed() function
    Revision History
        04.09.2009 Hannes Mezger: Initial version
*/

var unregisterRequest  = new UaUnregisterNodesRequest();
var unregisterResponse = new UaUnregisterNodesResponse();

Session.buildRequestHeader( unregisterRequest.RequestHeader );

var uaStatus = Session.unregisterNodes( unregisterRequest, unregisterResponse );

if( uaStatus.isGood() )
{
    var expectedResult = new ExpectedAndAcceptedResults(StatusCode.BadNothingToDo);
    checkUnregisterNodesFailed( unregisterRequest, unregisterResponse, expectedResult );
    
    addLog( "Session.unregisterNodes() succeeded" );
}
else
{
    addError( "Session.unregisterNodes() failed: " + uaStatus );
}


