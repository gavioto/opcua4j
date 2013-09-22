/*global UaNodeId, readSetting, GetDefaultReferencesFromNodeId, Session, addError,
  GetBrowseResponseForOneReference, BrowseNextFromResponseAndAssertReferencesMatch,
  StatusCode, AssertFalse
*/


function TestBrowseNextWhenMoreReferencesExist( doReleaseContinuationPoints, performCleanup )
{
    var nodeToBrowse = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has 3 Forward References 1" ).toString() );
    if( nodeToBrowse === undefined || nodeToBrowse === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '/Server Test/NodeIds/References/Has 3 Forward References 1'." );
        return;
    }

    // get expected references
    var expectedReferences = GetDefaultReferencesFromNodeId( Session, nodeToBrowse );
    if( expectedReferences.length < 3 )
    {
        addError( "Test cannot be completed: node must have at least three references." );
        return;
    }
    
    // Browse for first reference
    var firstResponse = GetBrowseResponseForOneReference( Session, [ nodeToBrowse ] );
    if( firstResponse === -1 )
    {
        return -1;
    }
    
    // BrowseNext for second reference
    // And validate that the reference from BrowseNext is the second reference (expectedReferences[1])
    var response = BrowseNextFromResponseAndAssertReferencesMatch( [ expectedReferences ], 1, 1, doReleaseContinuationPoints, firstResponse.Results );

    // Validate the releaseContinuationPoints = false case; the true case is covered within the above function
    if( !doReleaseContinuationPoints )
    {
        if( response.Results.length > 0 )
        {
            var result = response.Results[0];
            
            if( StatusCode.Good !== result.StatusCode.StatusCode )
            {
                addError( "StatusCode from BrowseNext is not Good: " + result.StatusCode, result.StatusCode );
            }
            if( AssertFalse( result.ContinuationPoint.isEmpty(), "ContinuationPoint is empty: " + result.ContinuationPoint ) )
            {
                BrowseNextFromResponseAndAssertReferencesMatch( [ expectedReferences ], 2, 2, doReleaseContinuationPoints, response.Results );
            }
        }
    }

    // perform clean-up?
    if( performCleanup !== undefined && performCleanup !== null && performCleanup === true )
    {
        releaseContinuationPoints( Session, response );
    }

    return [ firstResponse, response ];
}


// release ContinuationPoints returned in a response; no result checking
function releaseContinuationPoints( session, browseResponse )
{
    var request = CreateDefaultBrowseNextRequest( session );
    var response = new UaBrowseNextResponse();
    request.ReleaseContinuationPoints = true;
    for( var i = 0; i < browseResponse.Results.length; i++ )
    {
        request.ContinuationPoints[i] = browseResponse.Results[i].ContinuationPoint;
    }
    session.browseNext( request, response );
}