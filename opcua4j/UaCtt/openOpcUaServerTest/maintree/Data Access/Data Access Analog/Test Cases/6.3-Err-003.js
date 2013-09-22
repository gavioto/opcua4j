/*  Test 6.3 Error Test #3, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write to the InstrumentRange attribute on a node where the property exists.

    Revision History: 
        15-Feb-2010 Anand Taparia: Initial version.
        04-Mar-2010 NP: REVIEWED. Needs better Node to test against!
        02-Aug-2011 NP: Modified output message if feature is not supported.
*/

function write613Err003()
{
    // Get access to the analog node
    var item = MonitoredItem.fromSetting( "/Server Test/NodeIds/Static/DA Profile/AnalogType/NodeIdWithInstrumentRange", 0 );
    if( item == null || item == undefined )
    {
        addSkipped( "InstrumentRange" );
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
        
        // Initial flag (InstrumentRange not found yet)
        var attributeInstrumentRangeFound = false;        
        // Loop through all the references, till we find the 'InstrumentRange' attribute
        for ( var i=0; i<response.Results.length; i++)
        {
            for ( var n=0; n<response.Results[i].References.length; n++)
            {
                // Check for InstrumentRange attribute
                if (response.Results[i].References[n].BrowseName.Name == "InstrumentRange")
                {
                    addLog( "Found reference 'InstrumentRange'." );
                    
                    // Start write
                    print( "Setting 'Range' of the InstrumentRange attribute of the analog node '" + item.NodeSetting + "'." );
                    // Get the corresponding monitored item for this attribute node
                    var monitoredItems = MonitoredItem.fromNodeIds ( response.Results[i].References[n].NodeId.NodeId );
                    var instrumentRangeAttributeMonitoredItem = monitoredItems[0];
                     // set a valid value for Range
                    var obj = new UaExtensionObject();
                    var range = new UaRange();
                    range.High = 120;
                    range.Low = 0;
                    obj.setRange( range );
                    instrumentRangeAttributeMonitoredItem.SafelySetValueTypeKnown( obj, BuiltInType.ExtensionObject );
                    // Expected result
                    var results = [];
                    results[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
                    results[0].addAcceptedResult( StatusCode.BadNotSupported );
                    results[0].addAcceptedResult( StatusCode.BadUserAccessDenied );
                    if( WriteHelper.Execute( instrumentRangeAttributeMonitoredItem, results, true ) )
                    {
//                        addError( "Write failed for the InstrumentRange attribute of the analog node '" + item.NodeSetting + "'." );
                        if( !WriteHelper.writeResponse.Results[0].isGood() )
                        {
                            if( WriteHelper.writeResponse.Results[0].StatusCode === StatusCode.BadNotSupported )
                            {
                                _notSupported.store( "Write InstrumentRange", undefined, false );
                            }
                            else
                            {
                                addWarning( "Write to InstrumentRange failed (" + WriteHelper.writeResponse.Results[0] + ")." );
                            }
                        }
                    }                    
                    // We are done here!
                    attributeInstrumentRangeFound = true;
                    break;
                }                
            }
            // Punt if we have found the InstrumentRange attribute already
            if ( attributeInstrumentRangeFound ) break;
        }
        
        // Did not find the InstrumentRange attribute, hence the test is incomplete
        if ( !attributeInstrumentRangeFound )
        {
            addWarning( "InstrumentRange attribute not found for the analog node '" + item.NodeSetting + "'. Unable to complete test." );
        }
    }
    else
    {
        addError( "Browse(): status ", uaStatus, uaStatus );
    }
}

safelyInvoke( write613Err003 );