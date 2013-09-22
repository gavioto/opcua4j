/*  Test 5.8.1 Test 17; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Read a node of each supported DA PRofile derived Variable Type:
            TwoStateDiscreteType
           
        How this script works:
            1) browse the nodes of the derived DA profile data-types we're looking at
            2) if the nodes look valid (are of the desired data-types) then...
            3) perform a read to make sure that we can read a VQT.
            
    Revision History
        05-Oct-2009 NP: Initial version.
        09-Nov-2009 NP: REVIEWED.
        25-Jan-2010 NP: Removed VariableTypes not applicable to this Conformance Unit.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581017()
{
    var nodeToBrowse = MonitoredItem.fromSettings( NodeIdSettings.DAStaticTwoStateDiscreteItems() )[0];
    if( AssertNotNullOrEmpty( nodeToBrowse, "No node configured for Browsing." ) == false ) return;
    var referenceDefinitionNode = new MonitoredItem( new UaNodeId( Identifier.TwoStateDiscreteType ), 1 );
    // we'll store the definitionNodes (array above) elements here for the settings
    // that exist. This will make the comparisson much easier.
    var resultDefinitionCheck = [];

    // loop through each test here
    var browseRequest = new UaBrowseRequest();
    var browseResponse = new UaBrowseResponse();
    g_session.buildRequestHeader( browseRequest.RequestHeader );

    // configure the browse request
    browseRequest.NodesToBrowse[0].NodeId = nodeToBrowse.NodeId;
    browseRequest.NodesToBrowse[0].BrowseDirection = BrowseDirection.Forward;
    browseRequest.NodesToBrowse[0].IncludeSubtypes = false;
    browseRequest.NodesToBrowse[0].NodeClassMask = 0;//16;
    browseRequest.NodesToBrowse[0].ResultMask = 0;

    // add the type to our array for results checking
    resultDefinitionCheck[0] = referenceDefinitionNode.NodeId;

    // if no NodeIds were specified, there's nothing to do
    if( browseRequest.NodesToBrowse.length === 0 )
    {
        addWarning( "Test aborted, no Nodes defined. Browse part of the test Aborted!" );
        return;
    }

    // issue the browse
    var uaStatus = g_session.browse( browseRequest, browseResponse );

    // monitoredItems representing the reference nodes that we will read.
    var referencesToRead = [];

    // check result
    if( AssertBasicBrowseSuccess( uaStatus, browseResponse, browseRequest ) )
    {
        
        // in this verification we're going to add the nodes to read based on the 
        // successful validation of a browse.

        //stores the current node number that we're processing
        var readNodeNumber = 0;

        // loop thru results to find our desired type
        for( var resultCounter=0; resultCounter<browseResponse.Results.length; resultCounter++ )
        {
            var typeSoughtIsFound = false;
            print( "Looking for: type '" + resultDefinitionCheck[resultCounter] + "'" );

            // loop thru references
            for( var refCounter=0; refCounter<browseResponse.Results[resultCounter].References.length; refCounter++ )
            {
                // does *this* reference match what we're expecting?
                if( resultDefinitionCheck[resultCounter].equals( browseResponse.Results[resultCounter].References[refCounter].NodeId.NodeId ) )
                {
                    print( "\tFound Matching Reference NodeId: " + browseResponse.Results[resultCounter].References[refCounter].NodeId );

                    // we have a match, so we'll READ this node.
                    referencesToRead.push( new MonitoredItem( new UaNodeId( browseRequest.NodesToBrowse[resultCounter].NodeId ), resultCounter, Attribute.Value ) );
                    typeSoughtIsFound = true;
                    break;
                }
            }
            // was the desired type found?
            AssertNotEqual( false, typeSoughtIsFound, "Node: '" + browseRequest.NodesToBrowse[resultCounter].NodeId + "' " + "' does not derive from Type 'TwoStateDiscreteType')" );
        }
    }
    else
    {
        addError( "Browse failed: " + uaStatus.toString() );
    }


    // PART 2, the read.
    print( "\tReading the Node To Browse: " + nodeToBrowse.NodeId + " (setting: " + nodeToBrowse.NodeSetting );
    ReadHelper.Execute( nodeToBrowse );
    print( "\t\tResult: " + nodeToBrowse.Value );
    print( "\tReading the Reference nodes, of which there are : " + referencesToRead.length );
    ReadHelper.Execute( referencesToRead );
    for( var r=0; r<referencesToRead.length; r++ )
    {
        print( "\t\tResult[" + r + "]: " + referencesToRead[r].Value );
    }
}

safelyInvoke( read581017 );