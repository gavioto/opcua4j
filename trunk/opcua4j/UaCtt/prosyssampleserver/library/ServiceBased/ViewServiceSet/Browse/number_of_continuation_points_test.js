/*globals addError, addLog, AssertBasicBrowseServiceSuccess, AssertEqual, 
  AssertReferenceDescriptionsEqual, GetDefaultBrowseRequest, 
  GetDefaultReferencesFromNodeId, Session, StatusCode, UaBrowseResponse
*/


// Create and return a default Browse request using the same nodeId
// for the number of nodes specified.
function CreateDefaultBrowseRequestsForSameNode( session, nodeId, numberOfNodes )
{
    var request = GetDefaultBrowseRequest( session, nodeId );
    var nodeRequest = request.NodesToBrowse[0];

    for( var i = 1; i < numberOfNodes; i++)
    {
        request.NodesToBrowse[i] = nodeRequest;
    }

    return request;
}


// Test browsing a NodeId of invalid syntax.
// Returns:
//   -1 on failure to Browse 
//   0 if none of the results had status Bad_NoContinuationPoints
//   the 1-based index of the first result with status Bad_NoContinuationPoints
function BrowseNodesUntilOutOfContinuationPoints( nodeToBrowse, numberOfNodes, returnDiagnostics )
{
    var references = GetDefaultReferencesFromNodeId( Session, nodeToBrowse );
    if( references < 2 )
    {
        addError( "Test cannot be completed: node must have at least two forward references." );
    }
    var expectedReference = references[0];
    var request = CreateDefaultBrowseRequestsForSameNode( Session, nodeToBrowse, numberOfNodes );
    var response = new UaBrowseResponse();
    var firstExpectedFailure = -1;

    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
    request.RequestedMaxReferencesPerNode = 1;

    var uaStatus = Session.browse( request, response );

    // check result
    if( AssertBasicBrowseServiceSuccess( uaStatus, response, numberOfNodes ) )
    {
        // count the number of results failing with Bad_NoContinuationPoints
        // and the number failng with unexpected status codes
        var expectedFailures = 0;
        var unexpectedFailures = 0;
        for( var i = 0; i < response.Results.length; i++ )
        {
            if( response.Results[i].StatusCode.StatusCode !== StatusCode.Good )
            {
                if( response.Results[i].StatusCode.StatusCode === StatusCode.BadNoContinuationPoints )
                {
                    if( expectedFailures === 0 )
                    {
                        firstExpectedFailure = i;
                    }
                    expectedFailures++;
                }
                else
                {
                    // limit the number of times we display an error (just to not "over log")
                    if( unexpectedFailures < 5 )
                    {
                        addError( "Operation result " + i + " was unexpected: " + response.Results[i].StatusCode + ". Expected Good or BadNoContinuationPoints." );
                    }
                    unexpectedFailures++;
                }
            }

            if( AssertEqual( 1, response.Results[i].References.length, "Wrong number of references." ) )
            {
                AssertReferenceDescriptionsEqual( expectedReference, response.Results[i].References[0] );
            }
        }
        releaseContinuationPoints( Session, response );

        // report our test results
        addLog( "" + ( response.Results.length - expectedFailures - unexpectedFailures ) + " nodes browsed successfully." );
        addLog( "" + expectedFailures + " results returned Bad_NoContinuationPoints." );
        if( expectedFailures > 0 )
        {
            addLog( "First result to return Bad_NoContinuationPoints: " + firstExpectedFailure );
        }
        if( unexpectedFailures > 0 )
        {
            addError( "" + unexpectedFailures + " results returned an unexpected operation result." );
        }
    }
    else
    {
        addError( "Browse() status " + uaStatus, uaStatus );
        return -1;
    }
    return firstExpectedFailure + 1;
}