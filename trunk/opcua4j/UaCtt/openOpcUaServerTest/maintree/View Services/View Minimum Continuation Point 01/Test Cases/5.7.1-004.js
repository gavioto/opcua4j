/*    Test 5.7.1-4 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node has more than one reference
            And the requestedMaxReferencesPerNode is 1
          When Browse is called
          Then the server returns one reference
            And operation result Good
            And a non-null ContinuationPoint

          Validation is accomplished by first browsing all references on a node,
          storing the first reference, and comparing it to the returned reference
          when requestedMaxReferencesPerNode is 1.

      Revision History:
          2009-08-17 Dale Pope: Initial version
          2010-02-23 Dale Pope: Changed expectation of result GoodCallAgain to Good.
          2010-06-17 Dale Pope: Added clean up: release continuation points.
*/

/*globals addError, addLog, AssertBasicBrowseSuccess, AssertBrowseValidParameter,
  AssertEqual, AssertFalse, AssertReferenceDescriptionsEqual, GetTest1BrowseRequest,
  readSetting, Session, StatusCode, UaBrowseResponse, UaNodeId
*/


// Browse at least two references and then collect the first one.
function GetFirstReference( nodeId )
{
    var request = GetTest1BrowseRequest( Session, nodeId );
    var response = new UaBrowseResponse();
    
    var uaStatus = Session.browse( request, response );
    
    var references = [];
    
    // check result
    if( !AssertBasicBrowseSuccess( uaStatus, response, request ) )
    {
        return references;
    }

    if( response.Results[0].References.length < 2 )
    {
        addError( "Test cannot be completed: node must have at least two references." );
        return references;
    }
    
    references.push( response.Results[0].References[0] );
    return references;
}


// Test browsing for a maximum of one reference.
function TestBrowseOneNodeForOneReference( returnDiagnostics )
{
    // determine expected references
    var nodeToBrowse = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has Inverse And Forward References" ).toString() );
    if( nodeToBrowse === undefined || nodeToBrowse === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting 'Has Inverse And Forward References'." );
        return;
    }
    var expectedReferences = GetFirstReference( nodeToBrowse );
    if( expectedReferences.length === 0 )
    {
        addError( "Test cannot be completed: the node must have at least two references." );
        return;
    }

    // make request and browse
    var request = GetTest1BrowseRequest( Session, nodeToBrowse );
    var response = new UaBrowseResponse();

    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
    request.RequestedMaxReferencesPerNode = 1;

    var uaStatus = Session.browse( request, response );

    // check result
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( request, response );
        
        // verify continuationPoint, statusCode, and references
        var result = response.Results[0];
        if( AssertEqual( 1, result.References.length, "Number of expected references did not match number number of browsed references." ) )
        {
            AssertFalse( result.ContinuationPoint.isEmpty(), "ContinuationPoint not returned but more references exist." );
            if( result.StatusCode.StatusCode === StatusCode.Good )
            {
                // verify all the references are expected
                for( var i = 0; i < result.References.length; i++ )
                {
                    AssertReferenceDescriptionsEqual( expectedReferences[i], result.References[i], "Expected reference does not match browsed reference." );
                }
                addLog( "All expected references checked" );
            }
            else
            {
                addError( "Operation result status code is not Good: " + result.StatusCode, result.StatusCode );
            }
        }
        
        releaseContinuationPoints( Session, response );
    }
    else
    {
        addError( "browse() failed: " + uaStatus );
    }
}

TestBrowseOneNodeForOneReference( 0 );
TestBrowseOneNodeForOneReference( 0x3ff );