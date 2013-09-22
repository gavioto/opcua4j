/*  Test 6.3 Test #16, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Browse the available inverse-references of an Analog node.

    Revision History: 
        10-Feb-2010 Anand Taparia: Initial Version.
        03-Mar-2010 NP: REVIEWED.
        29-Mar-2011 NP: The node to browse is now dynamically chosen based on the settings available.
*/

function browse613016()
{
    // Get access to an analog node
    var analogNode = NodeIdSettings.GetDAAnalogStaticNodeIds( 1 ); //NodeIdSettings.DAStaticAnalog();
    if( analogNode.length == 0 )
    {
        addSkipped( "Static Analog" );
        return;
    }
    // We are interested in a single analog node for this test
    var nodeToBrowse = UaNodeId.fromString( analogNode.toString() );
    if( nodeToBrowse === undefined || nodeToBrowse === null )
    {
        addError( "Unable to genereate the NodeId for the Node to browse. Please debug this script." );
        return;
    }

    // Prepare to browse 
    var request = GetTest1BrowseRequest( g_session, nodeToBrowse );
    var response = new UaBrowseResponse();
    // Prepare to browse    
    request.RequestHeader.ReturnDiagnostics = 0;
    request.NodesToBrowse[0].BrowseDirection = BrowseDirection.Inverse;
    print ( "Browsing the inverse references of the analog node '" + analogNode + "'." );
    var uaStatus = g_session.browse( request, response );

    // Check result
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( request, response );
        var nCountOfReferences = 0;
        for ( var i=0; i<response.Results.length; i++)
        {
            for ( var n=0; n<response.Results[i].References.length; n++)
            {
                // Print info of the received inverse references
                addLog ( "Found inverse reference " + response.Results[i].References[n].BrowseName.Name + "." );
                nCountOfReferences++;
            }            
        }
        print ( "Total no. of inverse references found for analog node '" + analogNode + "': " + nCountOfReferences + "." );
    }
    else
    {
        addError( "Browse(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( browse613016 );