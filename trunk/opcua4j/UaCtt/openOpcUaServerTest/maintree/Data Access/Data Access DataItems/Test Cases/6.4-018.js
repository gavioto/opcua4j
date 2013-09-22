/*  Test 6.4 Test #18, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Browse the available references (both directions) of a DataItem node.

    Revision History: 
        19-Feb-2010 Anand Taparia: Initial Version.
        03-Mar-2010 NP: REVIEWED.
*/

function browse614018 ()
{
    // Get access to the DataItem node
    var dataItemNodes = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem() );
    if ( dataItemNodes.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }
    // We are interested in a single dataitem node for this test
    var nodeToBrowse = dataItemNodes[0].NodeId;

    // Prepare to browse
    var request = GetTest1BrowseRequest( g_session, nodeToBrowse );
    var response = new UaBrowseResponse();
    request.RequestHeader.ReturnDiagnostics = 0;
    request.NodesToBrowse[0].BrowseDirection = BrowseDirection.Both;
    print ( "Browsing the forward/inverse references of the DataItem node '" + nodeToBrowse + "'." );
    var uaStatus = g_session.browse( request, response );

    // Check result
    if ( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( request, response );
        
        var nCountOfForwardReferences = 0;
        var nCountOfInverseReferences = 0;
        for ( var i=0; i<response.Results.length; i++)
        {
            for ( var n=0; n<response.Results[i].References.length; n++)
            {
                // Print info of the received references
                if ( response.Results[i].References[n].IsForward )
                {
                    addLog ( "Found forward reference '" + response.Results[i].References[n].BrowseName.Name + "'." );
                    nCountOfForwardReferences++;
                }
                else
                {
                    addLog ( "Found inverse reference '" + response.Results[i].References[n].BrowseName.Name + "'." );
                    nCountOfInverseReferences++;
                }
            }            
        }
        print ( "Total no. of references found for DataItem node '" + nodeToBrowse + "':\n\tForward references: " + nCountOfForwardReferences + "\n\tInverse references: " + nCountOfInverseReferences );
    }
    else
    {
        addError( "Browse(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( browse614018 );