/*  Test 6.3 Error Test #2, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write to the EngineeringUnits attribute on a node where the property exists.

    Revision History: 
        15-Feb-2010 Anand Taparia: Initial version.
        04-Mar-2010 NP: REVIEWED. Needs better Node to test against!
        24-Aug-2010 NP: Bugfix: writes a valid EUInformation.
        02-Aug-2011 NP: Modified output message if feature is not supported.
*/

function write613Err002()
{
    // Get access to the analog node
    var item = MonitoredItem.fromSetting( "/Server Test/NodeIds/Static/DA Profile/AnalogType/NodeIdWithEngineeringUnits", 0 );
    if( item == null || item == undefined )
    {
        addSkipped( "EngineeringUnit" );
        return;
    }

    // Prepare to browse 
    var request = GetTest1BrowseRequest( g_session, item.NodeId );
    var response = new UaBrowseResponse();    
    request.RequestHeader.ReturnDiagnostics = 0;
    request.NodesToBrowse[0].NodeId = item.NodeId;
    request.NodesToBrowse[0].BrowseDirection = BrowseDirection.Both;
    print ( "Browsing the references of the analog node '" + item.NodeSetting + "'." );
    var uaStatus = g_session.browse( request, response );

    // Check result
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( request, response );
        
        // Initial flag (EngineeringUnits not found yet)
        var attributeEngineeringUnitsFound = false;        
        // Loop through all the references, till we find the 'EngineeringUnits' attribute
        for ( var i=0; i<response.Results.length; i++)
        {
            for ( var n=0; n<response.Results[i].References.length; n++)
            {
                // Check for EngineeringUnits attribute
                if( response.Results[i].References[n].BrowseName.Name == "EngineeringUnits" )
                {
                    addLog( "Found reference 'EngineeringUnits'." );
                    
                    // Start write
                    print( "Setting 'EUInformation' of the EngineeringUnits attribute of the analog node '" + item.NodeId + "'." );
                    // Get the corresponding monitored item for this attribute node
                    var monitoredItems = MonitoredItem.fromNodeIds ( response.Results[i].References[n].NodeId.NodeId );
                    var euAttributeMonitoredItem = monitoredItems[0];
                    // set a valid value for Engineering Units
                    var obj = new UaExtensionObject();
                    var info = new UaEUInformation();
                    info.DisplayName = new UaLocalizedText("units");
                    info.NamespaceUri = "6.1.3 Error Test 2";
                    obj.setEUInformation( info );
                    euAttributeMonitoredItem.SafelySetValueTypeKnown( obj, BuiltInType.ExtensionObject );
                    // Expected result
                    var results = [];
                    results[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
                    results[0].addAcceptedResult ( StatusCode.BadNotSupported );
                    results[0].addAcceptedResult ( StatusCode.BadUserAccessDenied );
                    if( WriteHelper.Execute( euAttributeMonitoredItem, results, true ) )
                    {
//                        addError ( "Write failed for the EngineeringUnits attribute of the analog node '" + item.NodeSetting + "'." );
                        if( !WriteHelper.writeResponse.Results[0].isGood() )
                        {
                            if( WriteHelper.writeResponse.Results[0].StatusCode === StatusCode.BadNotSupported )
                            {
                                _notSupported.store( "Write EUInformation", undefined, false );
                            }
                            else
                            {
                                addWarning( "Write to EUInformation failed (" + WriteHelper.writeResponse.Results[0] + ")." );
                            }
                        }
                    }                    
                    // We are done here!
                    attributeEngineeringUnitsFound = true;
                    break;
                }                
            }
            // Punt if we have found the EngineeringUnits attribute already
            if ( attributeEngineeringUnitsFound ) break;
        }
        
        // Did not find the EngineeringUnits attribute, hence the test is incomplete
        if ( !attributeEngineeringUnitsFound )
        {
            addWarning( "EngineeringUnits attribute not found for the analog node setting '" + item.NodeSetting + "'. Unable to complete test." );
        }
    }
    else
    {
        addError( "Browse(): status ", uaStatus, uaStatus );
    }
}

safelyInvoke( write613Err002 );