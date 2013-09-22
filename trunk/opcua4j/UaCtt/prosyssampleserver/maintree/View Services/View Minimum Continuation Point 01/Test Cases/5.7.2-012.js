/*    Test 5.7.2-12 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the node has at least three inverse references
            And RequestedMaxReferencesPerNode is not 0 or 1
            And Browse has been called
          When BrowseNext is called
            And ReleaseContinuationPoints is false
          Then the server returns the second set of references
            And ContinuationPoint is not empty
          
          Validation is accomplished by first browsing all inverse references
          on a node, then performing the test and comparing the second 
          reference to the reference returned by the BrowseNext call. So this
          test only validates that Browse two references is consistent with 
          Browse one reference followed by BrowseNext.

      Revision History:
          2009-09-08 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
*/

// Return the response from a call to Browse requesting a number of references of a node.
function GetBrowseResponseForMaxReferences( nodeToBrowse, maxReferences )
{
    var request = GetDefaultBrowseRequest( Session, nodeToBrowse );
    var response = new UaBrowseResponse();
    
    request.RequestedMaxReferencesPerNode = maxReferences;
    
    var uaStatus = Session.browse( request, response );
    
    if( !AssertBasicBrowseSuccess( uaStatus, response, request ) )
    {
        addError( "Test cannot be completed: Browse failed" );
        return -1;
    }

    return response;
}

function TestBrowseNextWithMaxReferences( nodeToBrowse, maxReferences, expectedReferences )
{
    if( maxReferences === 0 )
    {
        addWarning( "Skipping test because 'maxReferences' will expect 0 references (according to the parameter) which is not valid. This is likely a problem with the number of references that exist being small such that the formula used by this script (X / 2)-1 results in zero. Ignore this message." );
        return;
    }
    addLog( "Testing Browse/BrowseNext with RequestedMaxReferencesPerNode = " + maxReferences + " (out of " + expectedReferences.length + " total)" );
    
    // Browse for first reference
    var firstResponse = GetBrowseResponseForMaxReferences( nodeToBrowse, maxReferences );
    if( firstResponse == -1 )
    {
        return;
    }
    
    // BrowseNext for second reference
    // And validate that the reference from BrowseNext is the second reference (expectedReferences[1])
    AssertBrowseNextReturnsReferences( [ expectedReferences ], maxReferences, firstResponse );
}

function Test572012()
{
    var nodeToBrowse = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has 3 Forward References 1" ).toString() );
    if( nodeToBrowse == null )
    {
        addWarning( "Cannot perform test." );
        return;
    }

    // get expected references and ensure they're Inverse
    var expectedReferences = GetDefaultReferencesFromNodeId( Session, nodeToBrowse );
    if( expectedReferences.length < 3 )
    {
        addError( "Test cannot be completed: node must have at least three references." );
        return;
    }
    print( "~~~ EXPECTED REFERENCES LENGTH: " + expectedReferences.length );

    TestBrowseNextWithMaxReferences( nodeToBrowse, expectedReferences.length - 1, expectedReferences );
    TestBrowseNextWithMaxReferences( nodeToBrowse, expectedReferences.length - 2, expectedReferences );
    TestBrowseNextWithMaxReferences( nodeToBrowse, Math.floor( expectedReferences.length / 2 ), expectedReferences );
    TestBrowseNextWithMaxReferences( nodeToBrowse, Math.floor( expectedReferences.length / 2 ) - 1, expectedReferences );
    TestBrowseNextWithMaxReferences( nodeToBrowse, Math.floor( expectedReferences.length / 2 ) + 1, expectedReferences );
}

safelyInvoke( Test572012 );