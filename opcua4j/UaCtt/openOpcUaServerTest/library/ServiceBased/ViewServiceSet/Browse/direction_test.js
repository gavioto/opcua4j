/*global GetTest1ReferencesFromNodeId, Session, BrowseDirection, addError,
  UaNodeId, readSetting, GetTest1BrowseRequest, UaBrowseResponse,
  AssertBrowseValidParameter, StatusCode, AssertEqual, 
  AssertReferenceDescriptionsEqual, addLog, addWarning, AssertInRange
*/

// Browse all the references and then collect the ones that match
// the specified direction, which must be BrowseDirection.Forward 
// or .Inverse.
// Used by tests 5.7.1-2 and 5.7.1-3.
function GetIsDirectionReferences( nodeId, direction, sessionObject )
{
    var allReferences = null;
    if( sessionObject !== undefined && sessionObject !== null )
    {
        allReferences = GetTest1ReferencesFromNodeId( sessionObject, nodeId );
    }
    else
    {
        allReferences = GetTest1ReferencesFromNodeId( Session, nodeId );
    }
    if( allReferences == [] )
    {
        return allReferences;
    }
    
    var directionReferences = [];

    // collect diection references, and ensure there's at least one in the opposite direction
    var wantForward = ( direction == BrowseDirection.Forward );
    var areOppositeReferences = false;
    for( var i = 0; i < allReferences.length; i++ )
    {
        var reference = allReferences[i];
        if( direction == BrowseDirection.Both )
        {
            directionReferences.push( reference );
        }
        else
        {
            if( reference.IsForward == wantForward )
            {
                directionReferences.push( reference );
            }
            else
            {
                areOppositeReferences = true;
            }
        }
    }
    
    if( directionReferences.length === 0 )
    {
        addError( "Test cannot be completed: node has no references with IsForward == " + wantForward );
    }
    if( !areOppositeReferences )
    {
        addError( "Test cannot be completed: node has no references with IsForward == " + !wantForward );
    }
    
    return directionReferences;
}


// Test browsing in a particular direction (Forward or Inverse).
// Used by tests 5.7.1-2 and 5.7.1-3.
function TestBrowseOneNodeInDirection( direction, returnDiagnostics )
{
    var nodeToBrowse = UaNodeId.fromString( readSetting( NodeIdSettings.getNodeWithReferencesInBothDirections() ).toString() );
    if( nodeToBrowse === undefined || nodeToBrowse === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check settings (node with references in both directions)." );
        return;
    }
    var directionReferences = GetIsDirectionReferences( nodeToBrowse, direction );
    if (directionReferences.length === 0 )
    {
        addError( "Node cannot be used in this test. Forward and Inverse references must exist." );
        return;
    }

    var request = GetTest1BrowseRequest( Session, nodeToBrowse );
    var response = new UaBrowseResponse();
    
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
    request.NodesToBrowse[0].BrowseDirection = direction;

    var uaStatus = Session.browse( request, response );

    // check result
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( request, response );
        
        // verify references
        var i;
        var wantForward = ( direction == BrowseDirection.Forward );
        var directionName = ( direction == BrowseDirection.Forward ) ? "Forward" : "Inverse";
        var result = response.Results[0];
        if( result.StatusCode.StatusCode === StatusCode.Good )
        {
            if( result.ContinuationPoint.isEmpty() )
            {
                // verify all the references are all the IsForward references
                if( AssertEqual( directionReferences.length, result.References.length, "Number of 'IsForward = " + wantForward + "' references did not match number number of browsed " + directionName + " references." ) )
                {
                    for( i = 0; i < result.References.length; i++ )
                    {
                        AssertReferenceDescriptionsEqual( directionReferences[i], result.References[i], "'IsForward = " + wantForward + "' reference does not match browsed " + directionName + " reference." );
                    }
                    addLog( "All " + directionName + " references checked" );
                }
            }
            else
            {
                // verify that the references returned are IsForward references
                addWarning( "ContinuationPoint indicates more references exist. Only the returned references will be validated" );
                // there should be at least one reference and fewer than all the forward references
                if( AssertInRange( 1, directionReferences.length-1, result.References.length, "Invalid number of references returned." ) )
                {
                    for( i = 0; i < result.References.length; i++ )
                    {
                        AssertReferenceDescriptionsEqual( directionReferences[i], result.References[i], "'IsForward = " + wantForward + "' reference does not match browsed " + directionName + " reference." );
                    }
                    addLog( "Returned " + directionName + " references checked" );
                }
            }
        }
        else
        {
            addError( "Operation result status code is not Good:" + result.StatusCode, result.StatusCode );
        }
    }
    else
    {
        addError( "Browse() status " + uaStatus, uaStatus );
    }
}