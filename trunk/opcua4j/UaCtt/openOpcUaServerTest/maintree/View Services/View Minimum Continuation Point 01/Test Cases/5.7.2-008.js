/*    Test 5.7.2-8 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the node has at least three references of the same ReferenceType
            And RequestedMaxReferencesPerNode is 1
            And ReferenceTypeId is set to a ReferenceType NodeId
            And IncludeSubtypes is false
            And Browse has been called
          When BrowseNext is called
            And ReleaseContinuationPoints is false
          Then the server returns the second reference
            And ContinuationPoint is not empty

          Validation is accomplished by first browsing all references of a type
          on a node, then performing the test and comparing the second 
          reference to the reference returned by the BrowseNext call. So this
          test only validates that Browse two references is consistent with 
          Browse one reference followed by BrowseNext.

      Revision History:
          2009-09-08 DP: Initial version.
          2009-09-28 NP: REVIEWED.
*/

include("./library/ServiceBased/ViewServiceSet/BrowseNext/referencetype_test.js")

function TestBrowseNextWhenMoreReferencesOfTypeExist( )
{
    var nodeToBrowse = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has References With Different Parent Types" ).toString() );
    if( nodeToBrowse === undefined || nodeToBrowse === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '/Server Test/NodeIds/References/Has 3 Forward References 1'." );
        return;
    }
    var referenceTypeId = GetReferenceTypeWithThreeReferences( nodeToBrowse );
    if( referenceTypeId == -1 )
    {
        addSkipped( "[Configuration Issue?] Test cannot be completed: there are not three references of the same type." );
        return;
    }

    // get expected references and ensure they're of referenceTypeId
    expectedReferences = GetDefaultReferencesOfTypeFromNodeId( nodeToBrowse, referenceTypeId, false );
    for( var i = 0; i < expectedReferences.length; i++ )
    {
        if( !expectedReferences[i].ReferenceTypeId.equals( referenceTypeId ) )
        {
            addError( "Test cannot be completed: Browse returned references that did not match the ReferenceTypeId." );
            return;
        }
    }
    if( expectedReferences.length < 3 )
    {
        addError( "Test cannot be completed: node must have at least three references of the same type." );
        return;
    }

    // Browse for first reference
    var firstResponse = GetBrowseResponseForOneReferenceOfType( nodeToBrowse, referenceTypeId, false );
    if( firstResponse == -1 )
    {
        return;
    }

    // BrowseNext for second reference
    // And validate that the reference from BrowseNext is the second reference (expectedReferences[1])
    AssertBrowseNextReturnsReferences( [ expectedReferences ], 1, firstResponse );
}

// BrowseNext with ReleaseContinuationPoints = false (when more references exist)
safelyInvoke( TestBrowseNextWhenMoreReferencesOfTypeExist );