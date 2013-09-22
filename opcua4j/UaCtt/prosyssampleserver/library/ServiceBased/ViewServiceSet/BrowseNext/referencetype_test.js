// Return a referenceTypeId of which at least three references are of the type.
function GetReferenceTypeWithThreeReferences( nodeToBrowse )
{
    var references = GetDefaultReferencesFromNodeId( Session, nodeToBrowse );
    for( var i = 0; i < references.length; i++ )
    {
        typeCount = 0;
        for( var n = i + 1; n < references.length; n++ )
        {
            if( references[i].ReferenceTypeId.equals( references[n].ReferenceTypeId ) )
            {
                typeCount++;
                if( typeCount >= 3 )
                {
                    print( "\tReferenceTypeId found 3 times is: " + references[i].ReferenceTypeId + "; DisplayName: " + references[i].DisplayName );
                    return references[i].ReferenceTypeId;
                }
            }
        }
    }
    return -1; // didn't find one
}


// Browse for all references as per the test case default but
// only of a certain type. Return an empty array or an array
// containing all of the references.
function GetDefaultReferencesOfTypeFromNodeId( nodeToBrowse, referenceTypeId, includeSubtypes )
{
    print( "\tFinding references of type: " + referenceTypeId );
    var request = GetDefaultBrowseRequest( Session, nodeToBrowse );
    
    request.NodesToBrowse[0].ReferenceTypeId = referenceTypeId;
    request.NodesToBrowse[0].IncludeSubtypes = includeSubtypes;
    
    var references = GetReferencesFromRequest( Session, request );
    print( "\tFound " + references.length + " from type: " +referenceTypeId );
    return references[0];
}


// Return the response from a call to Browse requesting one reference of a particular type.
function GetBrowseResponseForOneReferenceOfType( nodeToBrowse, referenceTypeId, includeSubtypes )
{
    var request = GetDefaultBrowseRequest( Session, nodeToBrowse );
    var response = new UaBrowseResponse();
    
    request.RequestedMaxReferencesPerNode = 1;
    request.NodesToBrowse[0].ReferenceTypeId = referenceTypeId;
    request.NodesToBrowse[0].IncludeSubtypes = includeSubtypes;
    
    var uaStatus = Session.browse( request, response );
    
    if( !AssertBasicBrowseSuccess( uaStatus, response, request ) )
    {
        addError( "Test cannot be completed: Browse failed" );
        return -1;
    }

    return response;
}