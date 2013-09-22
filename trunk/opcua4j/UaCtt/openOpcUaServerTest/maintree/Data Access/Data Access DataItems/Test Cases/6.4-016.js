/*  Test 6.4 Test #16, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Browse the available forward-references of a DataItem node.

    Revision History: 
        19-Feb-2010 Anand Taparia: Initial version.
        03-Mar-2010 NP: REVIEWED.
*/

function browse614016 ()
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
    request.NodesToBrowse[0].BrowseDirection = BrowseDirection.Forward;
    print ( "Browsing the forward references of the dataitem node '" + nodeToBrowse + "'." );
    var uaStatus = g_session.browse( request, response );

    // Check result
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( request, response );
        
        for( var i=0; i<response.Results.length; i++)
        {
            for( var n=0; n<response.Results[i].References.length; n++)
            {
                // Check for Definition (optional)
                if (response.Results[i].References[n].BrowseName.Name == "Definition")
                {
                    addLog ( "Found forward reference 'Definition'." );
                    var optionalDefinitionItem = MonitoredItem.fromNodeIds( [response.Results[i].References[n].NodeId.NodeId] )[0];
                    if( ReadHelper.Execute( optionalDefinitionItem ) )
                    {
                        if ( BuiltInType.String == optionalDefinitionItem.DataType )
                        {
                            addLog ( "Received the expected datatype 'String' for Definition." );
                        }
                        else
                        {
                            addError ( "Did not receive the expected datatype for Definition. \n\tExpected datatype: String\n\tReceived datatype: " + BuiltInType.toString ( optionalDefinitionItem.DataType ) );
                        }
                    }
                }
                // Check for ValuePrecision (optional)
                else if (response.Results[i].References[n].BrowseName.Name == "ValuePrecision")
                {
                    addLog ( "Found forward reference 'ValuePrecision'." );
                    var optionalValuePrecisionItem = MonitoredItem.fromNodeIds( [response.Results[i].References[n].NodeId.NodeId] )[0];
                    if( ReadHelper.Execute( optionalValuePrecisionItem ) )
                    {
                        if ( BuiltInType.Double == optionalValuePrecisionItem.DataType )
                        {
                            addLog ( "Received the expected datatype 'Double' for ValuePrecision." );
                        }
                        else
                        {
                            addError ( "Did not receive the expected datatype for ValuePrecision. \n\tExpected datatype: Double\n\tReceived datatype: " + BuiltInType.toString ( optionalValuePrecisionItem.DataType ) );
                        }
                    }
                }
                // Check for HasTypeDefinition reference (required)
                else if ( response.Results[i].References[n].ReferenceTypeId.getIdentifierNumeric() == Identifier.HasTypeDefinition )
                {
                    addLog ( "Found reference 'HasTypeDefinition'." );
                    if ( response.Results[i].References[n].BrowseName.Name == "DataItemType" )
                    {
                        addLog ( "HasTypeDefinition reference points to variable type 'DataItemType' as expected." );
                    }
                    else
                    {
                        addLog ( "HasTypeDefinition reference does not point to the correct variable type.\n\tExpected variable type: DataItemType\n\tActual variable type: " + response.Results[i].References[n].BrowseName.Name );
                    }
                }
                // Check for HasModelParent reference (optional)
                else if ( response.Results[i].References[n].ReferenceTypeId.getIdentifierNumeric() == Identifier.HasModelParent )
                {
                    addLog ( "Found reference 'HasModelParent'. Parent name '" + response.Results[i].References[n].BrowseName.Name + "'." );
                }
                // Forward reference we are not interested in for this test
                else
                {
                    addLog ( "Found forward reference '" + response.Results[i].References[n].BrowseName.Name + "'(not of interest for this test)." );
                }
            }            
        }
    }
    else
    {
        addError( "Browse(): status ", uaStatus, uaStatus );
    }
}

safelyInvoke( browse614016 );