/*  Test prepared by Hannes Mezger hannes.mezger@ascolab.com
    Description:
        Script demonstrates how to use the checkRegisterNodesFailed() function
    Revision History
        04.09.2009 Hannes Mezger: Initial version
*/

var registerRequest  = new UaRegisterNodesRequest();
var registerResponse = new UaRegisterNodesResponse();

Session.buildRequestHeader( registerRequest.RequestHeader );

var uaStatus = Session.registerNodes( registerRequest, registerResponse );

if( uaStatus.isGood() )
{
    var expectedResult = new ExpectedAndAcceptedResults(StatusCode.BadNothingToDo);
    checkRegisterNodesFailed( registerRequest, registerResponse, expectedResult );
    
    addLog( "Session.registerNodes() succeeded" );
}
else
{
    addError( "Session.registerNodes() failed: " + uaStatus );
}


