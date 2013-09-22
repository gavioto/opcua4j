// Browse a node with a view that is invalid
function TestBrowseNodeWithInvalidView( nodeToBrowse, viewId, returnDiagnostics )
{
    var request = GetDefaultBrowseRequest( Session, nodeToBrowse );
    var response = new UaBrowseResponse();
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
    request.View.ViewId = viewId;

    uaStatus = Session.browse( request, response );
    
    // check result
    if( uaStatus.isGood() )
    {
        var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadViewIdUnknown );
        
        checkBrowseFailed( request, response, expectedServiceResult );
    }
    else
    {
        addError( "Browse() status " + uaStatus, uaStatus );
    }
}