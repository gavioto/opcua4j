/*  Test 6.3 Test #17, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Browse the available references (both directions) of an Analog node.

    Revision History: 
        10-Feb-2010 Anand Taparia: Initial Version.
        04-Mar-2010 NP: REVIEWED.
        29-Mar-2011 NP: The node to browse is now dynamically chosen based on the settings available.
*/

function browse613017()
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

    var request = GetTest1BrowseRequest( g_session, nodeToBrowse );
    // Prepare to browse
    var response = new UaBrowseResponse();
    request.RequestHeader.ReturnDiagnostics = 0;
    request.NodesToBrowse[0].BrowseDirection = BrowseDirection.Both;
    print ( "Browsing the forward/inverse references of the analog node '" + analogNode + "'." );
    var uaStatus = g_session.browse( request, response );

    // Check result
    if( uaStatus.isGood() )
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
        print ( "Total no. of references found for analog node '" + analogNode + "':\n\tForward references: " + nCountOfForwardReferences + "\n\tInverse references: " + nCountOfInverseReferences );
    }
    else
    {
        addError( "Browse(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( browse613017 );