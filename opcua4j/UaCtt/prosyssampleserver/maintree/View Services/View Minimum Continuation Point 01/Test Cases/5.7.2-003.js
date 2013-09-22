/*    Test 5.7.2-3 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the node has at least three forward references
            And RequestedMaxReferencesPerNode is 1
            And Browse has been called
          When BrowseNext is called for each additional reference
          Then the server returns each reference in turn
            And the last result has an empty ContinuationPoint

          Validation is accomplished by first browsing all references on a node,
          then performing the test while comparing the appropriate reference to the 
          reference returned by each BrowseNext call. So this test only validates
          that Browse all references is consistent with Browse one reference
          followed by BrowseNexts.

      Revision History:
          2009-09-03 DP: Initial version.
          2009-11-28 NP: REVIEWED.
*/

include("./library/ServiceBased/ViewServiceSet/BrowseNext/release_continuationpoints_test.js")

function TestBrowseNextToEnd()
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
    }

    // Browse for first reference
    var firstResponse = GetBrowseResponseForOneReference( Session, [ nodeToBrowse ] );
    if( firstResponse == -1 )
    {
        return;
    }

    // BrowseNext up to (but not including) the last reference
    var response = firstResponse;
    for( var i = 1; i < expectedReferences.length - 1; i++ )
    {
        // BrowseNext for next reference
        // And validate that the reference from BrowseNext is the next reference (expectedReferences[i])
        response = BrowseNextFromResponseAndAssertReferencesMatch( [ expectedReferences ], i, i, false, response.Results );
        if( response.Results.length == 0 )
        {
            return;
        }
        if( response.Results[0].ContinuationPoint.isEmpty() )
        {
            addError( "ContinuationPoint was empty before last reference retrieved." );
            return;
        }
    }

    // BrowseNext for the last reference
    response = BrowseNextFromResponseAndAssertReferencesMatch( [ expectedReferences ], expectedReferences.length - 1, expectedReferences.length - 1, false, response.Results );

    if( response.Results.length > 0 )
    {
        var result = response.Results[0];

        // Validate that ContinuationPoint is empty
        if( StatusCode.Good != result.StatusCode.StatusCode )
        {
            addError( "StatusCode from last BrowseNext is not Good: " + result.StatusCode, result.StatusCode );
        }
        AssertTrue( result.ContinuationPoint.isEmpty(), "ContinuationPoint is not empty: " + result.ContinuationPoint );
    }
}

safelyInvoke( TestBrowseNextToEnd );