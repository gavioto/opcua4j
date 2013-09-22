/*globals addError, AssertBasicBrowseSuccess, AssertBrowseNextReturnsReferences,
  GetReferencesFromRequest, GetTest1BrowseRequest, GetTest1ReferencesFromNodeId, 
  Session, UaBrowseResponse
*/

// Browse for all references as per the test case default but
// matching the nodeClassMask. Return an empty array or an array
// containing all of the references.
function GetTest1ReferencesOfNodeClassFromNodeId( nodeToBrowse, nodeClassMask )
{
    var request = GetTest1BrowseRequest( Session, nodeToBrowse );
    
    request.NodesToBrowse[0].NodeClassMask = nodeClassMask;
    
    var references = GetReferencesFromRequest( Session, request );
    
    return references[0];
}


// Return the response from a call to Browse requesting one nodeClassMask reference of a node.
function GetBrowseResponseForOneReferenceOfNodeClass( nodeToBrowse, nodeClassMask )
{
    var request = GetTest1BrowseRequest( Session, nodeToBrowse );
    var response = new UaBrowseResponse();
    
    request.RequestedMaxReferencesPerNode = 1;
    request.NodesToBrowse[0].NodeClassMask = nodeClassMask;
    
    var uaStatus = Session.browse( request, response );
    
    if( !AssertBasicBrowseSuccess( uaStatus, response, request ) )
    {
        addError( "Test cannot be completed: Browse failed" );
        return -1;
    }

    return response;
}


function TestBrowseNextWhenMoreNodeClassReferencesExist( nodeToBrowse, nodeClassMask )
{
    // get expected references and ensure they're of the node class
    var expectedReferences = GetTest1ReferencesOfNodeClassFromNodeId( nodeToBrowse, nodeClassMask );
    for( var i = 0; i < expectedReferences.length; i++ )
    {
        if( !( expectedReferences[i].NodeClass & nodeClassMask ) )
        {
            addWarning( "[Configuration Issue?] Test cannot be completed: Browse with NodeClassMask returned references of the wrong node class." );
            return;
        }
    }
    if( expectedReferences.length < 2 )
    {
        addWarning( "[Configuration Issue?] Test cannot be completed: node must have at least two references of the node class." );
        return;
    }

    // validate there is at least one type with a different parent
    var allReferences = GetTest1ReferencesFromNodeId( Session, nodeToBrowse );
    if( expectedReferences.length >= allReferences.length )
    {
        addWarning( "[Configuration Issue?] Test cannot be completed: node must have at least one reference with a node class that does not match the node class mask." );
        return;
    }

    // Browse for first reference
    var firstResponse = GetBrowseResponseForOneReferenceOfNodeClass( nodeToBrowse, nodeClassMask );
    if( firstResponse == -1 )
    {
        return;
    }
    
    // BrowseNext for second reference
    // And validate that the reference from BrowseNext is the second reference (expectedReferences[1])
    AssertBrowseNextReturnsReferences( [ expectedReferences ], 1, firstResponse );
}