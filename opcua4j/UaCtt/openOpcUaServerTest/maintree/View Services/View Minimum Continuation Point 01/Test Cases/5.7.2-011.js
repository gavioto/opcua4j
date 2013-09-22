/*    Test 5.7.2-11 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the node has at least three references
            And RequestedMaxReferencesPerNode is 1
            And ResultMask is set to include one result field
            And Browse has been called
          When BrowseNext is called
            And ReleaseContinuationPoints is false
          Then the server returns the second reference
            And ContinuationPoint is not empty.

      Revision History:
          2009-09-09 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2010-02-23 DP: Changed GoodCallAgain expectation to Good.
*/

/*globals addError, addWarning, AssertBasicBrowseSuccess, AssertEqual, AssertFalse,
  AssertReferenceDescriptionFieldsMatchMask, AssertTrue, 
  BrowseNextFromResponseAndAssertReferencesMatch, GetDefaultBrowseRequest, 
  GetReferencesFromRequest, readSetting, safelyInvoke, Session, StatusCode,
  UaBrowseResponse, UaNodeId
*/


// Browse for all references as per the test case default but
// with a ResultMask. Return an empty array or an array
// containing all of the references.
function GetDefaultReferencesWithResultMaskFromNodeId( nodeToBrowse, resultMask )
{
    var request = GetDefaultBrowseRequest( Session, nodeToBrowse );

    request.NodesToBrowse[0].ResultMask = resultMask;

    var references = GetReferencesFromRequest( Session, request );

    return references[0];
}


// Return the response from a call to Browse requesting one Inverse reference of a node.
function GetBrowseResponseForOneReferenceWithResultMask( nodeToBrowse, resultMask )
{
    var request = GetDefaultBrowseRequest( Session, nodeToBrowse );
    var response = new UaBrowseResponse();

    request.RequestedMaxReferencesPerNode = 1;
    request.NodesToBrowse[0].ResultMask = resultMask;

    var uaStatus = Session.browse( request, response );

    if( !AssertBasicBrowseSuccess( uaStatus, response, request ) )
    {
        addError( "Test cannot be completed: Browse failed" );
        return -1;
    }

    return response;
}

// BrowseNext for each element of expectedReferences[0] (other elements of the
// first dimension are ignored for now). Each BrowseNext is validated for the
// requested result fields.
function AssertBrowseNextReturnsRequestedFields( expectedReferences, response, resultMask )
{
    var result;
    var i;
    var expectedNumberOfResults = response.Results.length;

    // BrowseNext and validate up to (but not including) the final call
    for( i = 1; i < expectedReferences[0].length - 1; i++ )
    {
        response = BrowseNextFromResponseAndAssertReferencesMatch( expectedReferences, i, i, false, response.Results );

        AssertEqual( expectedNumberOfResults, response.Results.length );
        if( response.Results.length > 0 )
        {
            result = response.Results[0];

            // ContinuationPoint should not be empty
            if( StatusCode.Good !== result.StatusCode.StatusCode )
            {
                addError( "StatusCode from BrowseNext is not Good: " + result.StatusCode, result.StatusCode );
            }
            AssertFalse( result.ContinuationPoint.isEmpty(), "ContinuationPoint is empty: " + result.ContinuationPoint );

            // Result fieds should be as requested
            AssertReferenceDescriptionFieldsMatchMask( resultMask, expectedReferences[0][i], result.References[0], "BrowseNext " + i + " References[0]." );
        }
    }

    // Should BrowseNext one last time
    response = BrowseNextFromResponseAndAssertReferencesMatch( expectedReferences, expectedReferences[0].length - 1, expectedReferences[0].length - 1, false, response.Results );

    AssertEqual( expectedNumberOfResults, response.Results.length );
    if( response.Results.length > 0 )
    {
        result = response.Results[0];

        // ContinuationPoint should be empty
        if( StatusCode.Good != result.StatusCode.StatusCode )
        {
            addError( "StatusCode from last BrowseNext is not Good: " + result.StatusCode, result.StatusCode );
        }
        AssertTrue( result.ContinuationPoint.isEmpty(), "ContinuationPoint from last BrowseNext is not empty: " + result.ContinuationPoint );

        // Result fieds should be as requested
        i = expectedReferences[0].length - 1;
        AssertReferenceDescriptionFieldsMatchMask( resultMask, expectedReferences[0][i], result.References[0], "BrowseNext " + i + " References[0]." );
    }
}

function TestBrowseNextWhenResultMaskSet( nodeToBrowse, resultMask )
{
    // get expected references and ensure they're Inverse
    var expectedReferences = GetDefaultReferencesWithResultMaskFromNodeId( nodeToBrowse, resultMask );
    if( expectedReferences.length < 3 )
    {
        addError( "Test cannot be completed: node must have at least three references." );
        return;
    }

    // Browse for first reference
    var firstResponse = GetBrowseResponseForOneReferenceWithResultMask( nodeToBrowse, resultMask );
    if( firstResponse == -1 )
    {
        return;
    }

    // BrowseNext for second reference
    // And validate that the reference from BrowseNext is the second reference (expectedReferences[1])
    AssertBrowseNextReturnsRequestedFields( [ expectedReferences ], firstResponse, resultMask );
}

function Test572011()
{
    var nodeToBrowse = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has 3 Forward References 1" ).toString() );
    if( nodeToBrowse === null || nodeToBrowse === undefined )
    {
        addWarning( "Cannot perform test." );
        return;
    }
    for( var i = 0; i < 6; i++ )
    {
        var resultMask = 1 << i;
        TestBrowseNextWhenResultMaskSet( nodeToBrowse, resultMask );
    }
}

safelyInvoke( Test572011 );