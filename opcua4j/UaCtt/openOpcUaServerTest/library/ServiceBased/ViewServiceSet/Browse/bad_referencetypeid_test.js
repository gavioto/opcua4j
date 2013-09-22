// Test browsing a ReferenceTypeId that is bad in some way 
// (the expected operation status code is Bad_ReferenceTypeIdInvalid).
function TestBrowseBadReferenceTypeId( referenceTypeId, returnDiagnostics )
{
    var nodeToBrowse = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has Inverse And Forward References" ).toString() );
    if( nodeToBrowse === undefined || nodeToBrowse === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '/Server Test/NodeIds/References/Has Inverse And Forward References'." );
        return;
    }
    var request = GetDefaultBrowseRequest( Session, nodeToBrowse );
    var response = new UaBrowseResponse();
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
    request.NodesToBrowse[0].ReferenceTypeId = referenceTypeId;

    var uaStatus = Session.browse( request, response );

    // check result
    if( uaStatus.isGood() )
    {
        var expectedOperationResultsArray = [];
        expectedOperationResultsArray[0] = new ExpectedAndAcceptedResults();
        expectedOperationResultsArray[0].addExpectedResult( StatusCode.BadReferenceTypeIdInvalid );
        
        assertBrowseError( request, response, expectedOperationResultsArray );
    }
    else
    {
        addError( "Browse() status " + uaStatus, uaStatus );
    }
}
