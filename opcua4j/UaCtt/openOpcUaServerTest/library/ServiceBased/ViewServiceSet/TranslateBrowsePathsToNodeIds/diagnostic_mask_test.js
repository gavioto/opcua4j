/*global addLog, BrowsePathInfo UaNodeId, readSetting, ExpectedAndAcceptedResults,
  StatusCode, TestTranslateBrowsePathsToNodeIdsMultiMix,
  UaTranslateBrowsePathsToNodeIdsRequest,
  UaTranslateBrowsePathsToNodeIdsResponse, Session,
  checkTranslateBrowsePathsToNodeIdsFailed, addError
*/

// generate an operation error and validate diagnostics
function TestTranslateBrowsePathsToNodeIdsOperationErrorDiagnosticMask( returnDiagnosticMask )
{
    print( "Testing TranslateBrowsePathsToNodeIds operation error with RequestHeader.ReturnDiagnostics = " + returnDiagnosticMask );
    
    var startingNode = UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/UnknownNodeId1" ).toString() );
    
    var pathsToBrowse = [ new BrowsePathInfo() ];
    pathsToBrowse[0].browseNames = CreateQualifiedNamesArrayFromString( "0:NoSuchNodeHere" );
    pathsToBrowse[0].referenceTypeIds[0] = UaNodeId.fromString( "ns=4;i=4" );
    pathsToBrowse[0].targetNodeId = [];
    
    var expectedOperationResults = [1];
    expectedOperationResults[0] = new ExpectedAndAcceptedResults();
    expectedOperationResults[0].addExpectedResult( StatusCode.BadNodeIdUnknown );
    expectedOperationResults[0].addExpectedResult( StatusCode.BadNoMatch );

    TestTranslateBrowsePathsToNodeIdsMultiMix( [ startingNode ], pathsToBrowse, expectedOperationResults );
}


// generate service error and validate diagnostics
function TestTranslateBrowsePathsToNodeIdsServiceErrorDiagnosticMask( returnDiagnosticMask )
{
    print( "Testing TranslateBrowsePathsToNodeIds service error with RequestHeader.ReturnDiagnostics = " + returnDiagnosticMask );

    var request = new UaTranslateBrowsePathsToNodeIdsRequest();
    var response = new UaTranslateBrowsePathsToNodeIdsResponse();
    Session.buildRequestHeader( request.RequestHeader );
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnosticMask;

    // BrowsePaths[] defaults to be empty, so we can move on
    
    var uaStatus = Session.translateBrowsePathsToNodeIds( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        checkTranslateBrowsePathsToNodeIdsFailed( request, response, expectedServiceResult );
    }
    else
    {
        addError( "TranslateBrowsePathsToNodeIds() status " + uaStatus, uaStatus );
    }
}