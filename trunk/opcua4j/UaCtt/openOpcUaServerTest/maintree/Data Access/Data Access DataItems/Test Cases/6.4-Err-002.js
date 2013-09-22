/*  Test 6.4 Error Test #2, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write a value using the wrong data-type to a dataitem node that has property 
        "ValuePrecision"

    Revision History: 
        19-Feb-2010 Anand Taparia: Initial version.
        26-Aug-2010 NP: Skips the testing of a String type.
*/

function write614Err002 ()
{
    // Get handle to dataitem nodes
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem(), 1 );
    if ( monitoredItems.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }
    
    // Loop through the items
    for ( var i=0; i<monitoredItems.length; i++ )
    {
        var hasPropertyReferenceType = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.HasProperty ) )[0];//fromSetting( "/Server Test/NodeIds/References/HasProperty", 1 );
        if ( hasPropertyReferenceType == null )
        {
            addWarning( "Test cannot be completed: HasProperty types not set in settings." );
            return;
        }
        // check if a string node is specified and skip it
        if( NodeIdSettings.guessType( monitoredItems[i].NodeSetting ) === BuiltInType.String )
        {
            addLog( "Skipping string node '" + monitoredItems[i].NodeSetting + "'. Strings writing to Strings will not result in a type mismatch otherwise!" );
            continue;
        }
        var browseRequest = GetDefaultBrowseRequest( g_session, monitoredItems[i].NodeId );
        var browseResponse = new UaBrowseResponse();
        browseRequest.NodesToBrowse[0].ReferenceTypeId = hasPropertyReferenceType.NodeId;
        print ( "Browsing the ValuePrecision property of the dataitem node '" + monitoredItems[0].NodeSetting + "'." );
        var uaStatus = g_session.browse( browseRequest, browseResponse );
        if ( uaStatus.isGood() )
        {
            AssertBrowseValidParameter( browseRequest, browseResponse );
            
            var valuePrecisionFound = false;
            for ( var n=0; n<browseResponse.Results.length; n++ )
            {
                for ( var r=0; r<browseResponse.Results[n].References.length; r++ )
                {
                    if ( browseResponse.Results[n].References[r].BrowseName.Name == "ValuePrecision" )
                    {
                        valuePrecisionFound = true;
                        break;
                    }
                }
                // Our work here in this loop is done if we have found the ValuePrecision property
                if ( valuePrecisionFound ) break;
            }
            
            // If ValuePrecision found
            if ( valuePrecisionFound )
            {
                addLog ( "ValuePrecision property found in node '" + monitoredItems[i].NodeSetting + "'. Writing a string value to this node." );
                
               // Now do a write to this node
                monitoredItems[i].Value.Value = new UaVariant ();
                monitoredItems[i].Value.Value.setString ( "ABC" );
                // Expected result
                var results = [];
                results[0] = new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch );
                // Write the value
                if( WriteHelper.Execute( monitoredItems[i], results, true ) == false )
                {                
                    addError( "Write failed for node: '" + monitoredItems[i].NodeSetting + "'." );
                    continue;
                }
            }
            else
            {
                print ( "Node '" + monitoredItems[0].NodeSetting + "' does not have the ValuePrecision property." );
            }
        }
        else
        {
            addError( "Browse(): status " + uaStatus, uaStatus );
        }
    }
    
    // Test complete
    print ( "********************" );
    print ( "Test Complete." );
    print ( "********************" ); 
}

safelyInvoke( write614Err002 );