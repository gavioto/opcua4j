/*  Test 6.3 Test #15, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Browse the available forward-references of an Analog node.

    Revision History: 
        10-Feb-2010 Anand Taparia: Initial Version (based on function 'TestBrowseOneNodeInDirection' by DP)
        03-Mar-2010 NP: REVIEWED.
        29-Mar-2011 NP: The node to browse is now dynamically chosen based on the settings available.
*/

function browse613015()
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
    request.RequestHeader.ReturnDiagnostics = 0;
    request.NodesToBrowse[0].BrowseDirection = BrowseDirection.Forward;
    print ( "Browsing the forward references of the analog node '" + analogNode + "'." );
    var uaStatus = g_session.browse( request, response );

    // Check result
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( request, response );
        
        // Initial flag (mandatory EURange not found yet)
        var mandatoryEURangeFound = false;        
        for( var i=0; i<response.Results.length; i++)
        {
            for( var n=0; n<response.Results[i].References.length; n++)
            {
                // Check for EURange (required)
                if (response.Results[i].References[n].BrowseName.Name == "EURange")
                {
                    mandatoryEURangeFound = true;
                    addLog ( "Found forward reference 'EURange'." );
                    var euRangeItem = MonitoredItem.fromNodeIds( [response.Results[i].References[n].NodeId.NodeId] )[0];
                    if( ReadHelper.Execute( euRangeItem ) )
                    {
                        if ( BuiltInType.ExtensionObject == euRangeItem.DataType )
                        {
                            var euObject = euRangeItem.Value.Value.toExtensionObject().toRange();
                            if ( AssertNotNullOrEmpty( euObject, "EURange is not of the type 'Range'" ) == true )
                            {
                                addLog ( "Received the expected datatype 'Range' for EURange." );
                            }
                            AssertNotNullOrEmpty( euObject.Low, "Low, does not exist." );
                            AssertNotNullOrEmpty( euObject.High, "High, does not exist." );                            
                        }
                        else
                        {
                            addError( "Did not receive the expected datatype for EURange. \n\tExpected datatype: Range\n\tReceived datatype: " + BuiltInType.toString ( euRangeItem.DataType ) );
                        }
                    }
                }
                // Check for InstrumentRange (optional)
                else if (response.Results[i].References[n].BrowseName.Name == "InstrumentRange")
                {
                    addLog( "Found forward reference 'InstrumentRange'." );
                    var optionalInstrumentRangeItem = MonitoredItem.fromNodeIds( [response.Results[i].References[n].NodeId.NodeId] )[0];
                    if( ReadHelper.Execute( optionalInstrumentRangeItem ) )
                    {
                        if ( BuiltInType.ExtensionObject == optionalInstrumentRangeItem.DataType )
                        {
                            var instrObject = optionalInstrumentRangeItem.Value.Value.toExtensionObject().toRange();
                            if ( AssertNotNullOrEmpty( instrObject, "InstrumentRange is not of the type 'Range'" ) == true )
                            {
                                addLog( "Received the expected datatype 'Range' for InstrumentRange." );
                            }
                            AssertNotNullOrEmpty( instrObject.Low, "Low, does not exist." );
                            AssertNotNullOrEmpty( instrObject.High, "High, does not exist." );                            
                        }
                        else
                        {
                            addError( "Did not receive the expected datatype for InstrumentRange. \n\tExpected datatype: Range\n\tReceived datatype: " + BuiltInType.toString ( optionalInstrumentRangeItem.DataType ) );
                        }
                    }
                }
                // Check for EngineeringUnits (optional)
                else if( response.Results[i].References[n].BrowseName.Name == "EngineeringUnits" )
                {
                    addLog( "Found forward reference 'EngineeringUnits'." );
                    var optionalEngineeringUnitsItem = MonitoredItem.fromNodeIds( [response.Results[i].References[n].NodeId.NodeId] )[0];
                    if( ReadHelper.Execute( optionalEngineeringUnitsItem ) )
                    {
                        if( BuiltInType.ExtensionObject == optionalEngineeringUnitsItem.DataType )
                        {
                            var euObject = optionalEngineeringUnitsItem.Value.Value.toExtensionObject().toEUInformation();
                            if( AssertNotNullOrEmpty( euObject, "EngineeringUnits is not of the type 'EUInformation'" )== true )
                            {
                                addLog( "Received the expected datatype 'EUInformation' for EngineeringUnits." );
                            }
                        }
                        else
                        {
                            addError( "Did not receive the expected datatype for EngineeringUnits. \n\tExpected datatype: EUInformation\n\tReceived datatype: " + BuiltInType.toString ( optionalEngineeringUnitsItem.DataType ) );
                        }
                    }
                }
                // Check for Definition (optional)
                else if( response.Results[i].References[n].BrowseName.Name == "Definition" )
                {
                    addLog( "Found forward reference 'Definition'." );
                    var optionalDefinitionItem = MonitoredItem.fromNodeIds( [response.Results[i].References[n].NodeId.NodeId] )[0];
                    if( ReadHelper.Execute( optionalDefinitionItem ) )
                    {
                        if( BuiltInType.String == optionalDefinitionItem.DataType )
                        {
                            addLog( "Received the expected datatype 'String' for Definition." );
                        }
                        else
                        {
                            addError( "Did not receive the expected datatype for Definition. \n\tExpected datatype: String\n\tReceived datatype: " + BuiltInType.toString (optionalInstrumentRangeItem.DataType) );
                        }
                    }
                }
                // Check for ValuePrecision (optional)
                else if( response.Results[i].References[n].BrowseName.Name == "ValuePrecision" )
                {
                    addLog( "Found forward reference 'ValuePrecision'." );
                    var optionalValuePrecisionItem = MonitoredItem.fromNodeIds( [response.Results[i].References[n].NodeId.NodeId] )[0];
                    if( ReadHelper.Execute( optionalValuePrecisionItem ) )
                    {
                        if ( BuiltInType.Double == optionalValuePrecisionItem.DataType )
                        {
                            addLog( "Received the expected datatype 'Double' for ValuePrecision." );
                        }
                        else
                        {
                            addError( "Did not received the expected datatype for ValuePrecision. \n\tExpected datatype: Double\n\tReceived datatype: " + BuiltInType.toString (optionalValuePrecisionItem.DataType) );
                        }
                    }
                }
                // Check for HasTypeDefinition reference (required)
                else if( response.Results[i].References[n].ReferenceTypeId.getIdentifierNumeric() == Identifier.HasTypeDefinition )
                {
                    addLog( "Found reference 'HasTypeDefinition'." );
                    if( response.Results[i].References[n].BrowseName.Name == "AnalogItemType" )
                    {
                        addLog( "HasTypeDefinition reference points to variable type 'AnalogItemType' as expected." );
                    }
                    else
                    {
                        addLog( "HasTypeDefinition reference does not point to the correct variable type.\n\tExpected variable type: AnalogItemType\n\tActual variable type: " + response.Results[i].References[n].BrowseName.Name );
                    }
                }
                // Check for HasModelParent reference (optional)
                else if( response.Results[i].References[n].ReferenceTypeId.getIdentifierNumeric() == Identifier.HasModelParent )
                {
                    addLog( "Found reference 'HasModelParent'. Parent name '" + response.Results[i].References[n].BrowseName.Name + "'." );
                }
                // Forward reference we are not interested in for this test
                else
                {
                    addLog( "Found forward reference '" + response.Results[i].References[n].BrowseName.Name + "'(not of interest for this test)." );
                }
            }            
        }

        // We have processed all the received forward references. Must have received the mandatory EURange
        if ( !mandatoryEURangeFound )
        {
            addError( "Mandatory forward reference EURange not found." );
        }
    }
    else
    {
        addError( "Browse(): status: ", uaStatus, uaStatus );
    }
}

safelyInvoke( browse613015 );