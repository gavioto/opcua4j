/*    Test 5.7.1-17 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the node has references of different types with different parents
            And a ReferenceTypeId (that matches a reference's parent) is specified in the call
            And IncludeSubtypes is true
          When Browse is called
          Then the server returns references of type referenceTypeId's child types
          
          Validation is accomplished by first browsing all references on a node,
          storing the references of the specified type or subtype, and comparing those 
          references to the "ReferenceTypeId = [specified type or subtype]" references
          (expecting them to be equal).
          
          A hole in the test: if the Browse call returns only some references
          (i.e., requires BrowseNext), only the references returned by Browse
          are validated (because this is a Browse test, not BrowseNext). If 
          all the returned references match the specified type, the test passes,
          even though calling BrowseNext might return references of an
          unspecified type.

      Revision History:
          2009-08-25 Dale Pope: Initial version.
          2009-11-25 NP: REVIEWED (verified using SERVER object nodeId).
          2011-03-11 NP: Revised the validation to check references appear anywhere within the response.
*/


// Test browsing with a specific ReferenceTypeId.
// Browse for all references and then browse for references
// of the first reference's type. And then validate.
function TestBrowseOneNodeWithParentReferenceTypeIdSubtypes( returnDiagnostics )
{
    const CONST_SETTING = "/Server Test/NodeIds/References/Has References With Different Parent Types";
    var nodeToBrowse = UaNodeId.fromString( readSetting( CONST_SETTING ).toString() );
    if( nodeToBrowse === undefined || nodeToBrowse === null )
    {
        addWarning( "Skipping test. Setting not configured '" + CONST_SETTING + "'." );
        return;
    }

    var referenceTypes = [];
    var allReferences = GetReferencesAndCountParentTypes( nodeToBrowse, referenceTypes );
    if( allReferences.length == 0 )
    {
        addError( "Test cannot be completed: the node must have at least two references." );
        return;
    }

    var request = GetTest1BrowseRequest( Session, nodeToBrowse );
    var response = new UaBrowseResponse();
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
    request.NodesToBrowse[0].ReferenceTypeId = GetReferenceTypeFirstParent( allReferences[0].ReferenceTypeId );
    request.NodesToBrowse[0].IncludeSubtypes = true;

    uaStatus = Session.browse( request, response );

    // check result
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( request, response );

        var nodeRequest = request.NodesToBrowse[0];

        // collect expected references (those matching the specified ReferenceTypeId or its subtypes)
        var expectedTypes = [ nodeRequest.ReferenceTypeId ];
        expectedTypes = expectedTypes.concat( GetReferenceTypeSubtypes( nodeRequest.ReferenceTypeId ) );
        var expectedReferences = GetReferencesOfTypes( allReferences, expectedTypes );
        if( expectedReferences.length == allReferences.length )
        {
            addError( "Test cannot be completed: all the node's references are the same type or are subtypes of the requested type." );
        }

        // compare expected references to returned references
        var resultRefs = response.Results[0].References;
        AssertNodeReferencesInListNotOrdered( expectedReferences, resultRefs );

        // all returned references should be of the expected type (handy for logging, otherwise redundant)
        var result = response.Results[0];
        AssertReferencesAreOfTypes( expectedTypes, result.References );
    }
    else
    {
        addError( "browse() failed: " + uaStatus );
    }
}

TestBrowseOneNodeWithParentReferenceTypeIdSubtypes( 0 );
TestBrowseOneNodeWithParentReferenceTypeIdSubtypes( 0x3ff );