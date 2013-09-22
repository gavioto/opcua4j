/*    Test 5.7.1-Err-3 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the BrowseDirection is a value outside of the enum
          When Browse is called
          Then the server returns an operation result of BadBrowseDirectionInvalid

      Revision History
          2009-08-27 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
*/

// Browse a node with an invalid BrowseDirection
function TestBrowseNodeToNowhere( returnDiagnostics )
{
    var nodeId = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has Inverse And Forward References" ).toString() );
    if( nodeId === undefined || nodeId === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '/Server Test/NodeIds/References/Has Inverse And Forward References'." );
        return;
    }
    var request = GetDefaultBrowseRequest( Session, nodeId );
    var response = new UaBrowseResponse();
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
    request.NodesToBrowse[0].BrowseDirection = 64;

    uaStatus = Session.browse( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedOperationResultsArray = [1];
        expectedOperationResultsArray[0] = new ExpectedAndAcceptedResults();
        expectedOperationResultsArray[0].addExpectedResult( StatusCode.BadBrowseDirectionInvalid );
        
        assertBrowseError( request, response, expectedOperationResultsArray );
    }
    else
    {
        addError( "browse() failed: " + uaStatus );
    }
}

TestBrowseNodeToNowhere( 0 );
TestBrowseNodeToNowhere( 0x3ff );