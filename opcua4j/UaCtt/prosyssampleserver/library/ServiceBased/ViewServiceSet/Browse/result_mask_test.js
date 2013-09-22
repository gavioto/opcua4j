// Test browsing with specified result mask.
function TestBrowseOneNodeWithResultMask( nodeToBrowse, resultMask, returnDiagnostics  )
{
    addLog( "Testing resultMask <" + resultMask + "> with returnDiagnositcs <" + returnDiagnostics + "> on node <" + nodeToBrowse + ">" );

    var allReferences = GetTest1ReferencesFromNodeId( Session, nodeToBrowse );
    if( allReferences.length == 0 )
    {
        addError( "Test cannot be completed: the node <" + nodeToBrowse + "> must have at least one reference." );
        return -1;
    }

    // check references for all fields
    for( var i = 0; i < allReferences.length; i++ )
    {
        var referenceText = "References[" + i + "].";
        AssertNotNullNodeId( allReferences[i].ReferenceTypeId, referenceText + "ReferenceTypeId is a null NodeId" );
        if( allReferences[i].IsForward == null )
        {
            addError( referenceText + "IsForward is null" )
        }
        if( ( allReferences[i].NodeClass == null ) || ( allReferences[i].NodeClass == 0 ) )
        {
            addError( referenceText + "NodeClass is null or invalid: " + allReferences[i].NodeClass )
        }
        AssertNotNullQualifiedName( allReferences[i].BrowseName, referenceText + "BrowseName is null or empty" );
        AssertNotNullLocalizedText( allReferences[i].DisplayName, referenceText + "DisplayName is null or empty" );
    }

    // browse
    var request = GetTest1BrowseRequest( Session, nodeToBrowse );
    var response = new UaBrowseResponse();
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
    request.NodesToBrowse[0].ResultMask = resultMask;

    uaStatus = Session.browse( request, response );

    // check result
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( request, response );
        
        // verify references
        var result = response.Results[0];
        if( result.StatusCode.isGood() )
        {
            // verify all the references have appropriate fields
            for( var i = 0; i < result.References.length; i++ )
            {
                AssertReferenceDescriptionFieldsMatchMask( resultMask, allReferences[i], result.References[i], "References[" + i + "]." );
            }
        }
        else
        {
            addError( "Operation result status code is not good for resultMask <" + resultMask +">", result.StatusCode );
        }
    }
    else
    {
        addError( "Browse() resultMask <" + resultMask +"> status " + uaStatus, uaStatus );
    }
}