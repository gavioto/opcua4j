/*    Test 5.7.2-5 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given two nodes to browse
            And the nodes exist
            And each node has at least three forward references
            And RequestedMaxReferencesPerNode is 1
            And Browse has been called separately for each node
          When BrowseNext is called
          Then the server returns references for both nodes
            And ContinuationPoints for both nodes

          Validation is accomplished by first browsing all references on a node,
          then performing the test while comparing the appropriate references to the 
          references returned by each BrowseNext call. So this test only validates
          that Browse all references is consistent with Browse one reference
          followed by BrowseNexts.

      Revision History:
          2009-09-08 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2010-02-23 DP: Changed GoodCallAgain expectation to Good.
          2010-06-17 DP: Added clean up: release all continuation points.
*/

/*globals addError, addWarning, AssertEqual, AssertFalse,
  BrowseNextAndAssertReferencesMatch, BrowseNextFromResponseAndAssertReferencesMatch, 
  CreateDefaultBrowseNextRequest, GetBrowseResponseForOneReference, 
  GetDefaultReferencesFromNodeIds, readSetting, safelyInvoke, Session, StatusCode, 
  UaNodeId
*/


// Using an array of ContinuationPoints, built a BrowseNextRequest, call BrowseNext, and validate.
function BrowseNextFromContinuationPointsAndAssertReferencesMatch( expectedReferences, referenceIndex, releaseContinuationPoints, continuationPoints )
{
    var request = CreateDefaultBrowseNextRequest( Session );

    // build request
    request.ReleaseContinuationPoints = releaseContinuationPoints;
    for( var i = 0; i < continuationPoints.length; i++ )
    {
        request.ContinuationPoints[i] = continuationPoints[i];
    }

    return BrowseNextAndAssertReferencesMatch( expectedReferences, referenceIndex, referenceIndex, request );
}

function TestBrowseNextOnCombinedNodes()
{
    var i;
    
    var nodeIdsToBrowse = [
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has 3 Forward References 1" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has 3 Forward References 2" ).toString() )
    ];

    if( nodeIdsToBrowse === null || nodeIdsToBrowse[0] === null || nodeIdsToBrowse[1] === null )
    {
        addWarning( "Cannot perform test.");
        return;
    }

    // get expected references
    var expectedReferences = GetDefaultReferencesFromNodeIds( Session, nodeIdsToBrowse );
    for( i = 0; i < expectedReferences.length; i++ )
    {
        if( expectedReferences[i].length < 3 )
        {
            addError( "Test cannot be completed: node does not have at least three references: " + nodeIdsToBrowse[i] );
            return;
        }
    }

    // Browse for first references
    var firstResponse1 = GetBrowseResponseForOneReference( Session, [ nodeIdsToBrowse[0] ] );
    if( firstResponse1 == -1 )
    {
        return;
    }
    var firstResponse2 = GetBrowseResponseForOneReference( Session, [ nodeIdsToBrowse[1] ] );
    if( firstResponse2 == -1 )
    {
        return;
    }

    var continuationPoints = [
        firstResponse1.Results[0].ContinuationPoint,
        firstResponse2.Results[0].ContinuationPoint
    ];

    // BrowseNext
    var response = BrowseNextFromContinuationPointsAndAssertReferencesMatch( expectedReferences, 1, false, continuationPoints );

    // Validate that each ContinuationPoint is not empty
    var haveAllContinuationPoints = true;
    AssertEqual( continuationPoints.length, response.Results.length, "Number of ContinuationPoints did not match number of Results" );
    for( i = 0; i < response.Results.length; i++ )
    {
        var result = response.Results[i];
       
        if( StatusCode.Good != result.StatusCode.StatusCode )
        {
            addError( "StatusCode from BrowseNext is not Good when more references exist: " + result.StatusCode, result.StatusCode );
        }
        if( !AssertFalse( result.ContinuationPoint.isEmpty(), "ContinuationPoint is empty when more references exist: " + result.ContinuationPoint ) )
        {
            haveAllContinuationPoints = false;
        }
    }

    // BrowseNext again to validate ContinuationPoints were truly correct
    if( haveAllContinuationPoints )
    {
        response = BrowseNextFromResponseAndAssertReferencesMatch( expectedReferences, 2, 2, false, response.Results );
    }
    
    releaseContinuationPoints( Session, response );
}

safelyInvoke( TestBrowseNextOnCombinedNodes );