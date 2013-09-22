/*  Test 6.4 Test #17, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Browse the available inverse-references of a DataItem node.

    Revision History: 
        19-Feb-2010 Anand Taparia: Initial Version.
        03-Mar-2010 NP: REVIEWED.
*/

function browse614017 ()
{
    // Get access to the DataItem node
    var dataItemNodes = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem() );
    if ( dataItemNodes.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }
    // We are interested in a single DataItem node for this test
    var nodeToBrowse = dataItemNodes[0].NodeId;

    // Prepare to browse 
    var request = GetTest1BrowseRequest( g_session, nodeToBrowse );
    var response = new UaBrowseResponse();
    request.RequestHeader.ReturnDiagnostics = 0;
    request.NodesToBrowse[0].BrowseDirection = BrowseDirection.Inverse;
    print ( "Browsing the inverse references of the DataItem node '" + nodeToBrowse + "'." );
    var uaStatus = g_session.browse( request, response );

    // Check result
    if ( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( request, response );
        var nCountOfReferences = 0;
        for ( var i=0; i<response.Results.length; i++)
        {
            for ( var n=0; n<response.Results[i].References.length; n++)
            {
                // Print info of the received inverse references
                addLog ( "Found inverse reference '" + response.Results[i].References[n].BrowseName.Name + "'." );
                nCountOfReferences++;
            }            
        }
        print ( "Total no. of inverse references found for dataitem node '" + nodeToBrowse + "': " + nCountOfReferences + "." );
    }
    else
    {
        addError( "Browse(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( browse614017 );