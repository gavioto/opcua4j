/*  Test 6.4 Test #8, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write to a dataitem node that has property “ValuePrecision”. Read back the 
        value to determine that either the values are same or else differ within the 
        range specified by the precision. Test for datatypes: Float/Double/DateTime

    Revision History: 
        19-Feb-2010 Anand Taparia: Initial version.
        27-Aug-2010 NP: Revised to use new algorithm for testing Precision. (Thanks RandyArmstrong for algorithm)
*/

function write614008 ()
{
    // Get handle to dataitem node
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem(), 1 );
    if ( monitoredItems.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }
    
    // Only these datatypes for this test
    var dataTypesToTest = [ BuiltInType.Float, BuiltInType.Double, BuiltInType.DateTime ];
    
    // Loop through the items and test the datatypes of interest
    for ( var i=0; i<monitoredItems.length; i++ )
    {
        // Continue only if datatype of interest
        var currentNodeDataType = NodeIdSettings.guessType ( monitoredItems[i].NodeSetting );
        var dataTypesToTestIndex = 0;
        for ( dataTypesToTestIndex=0; dataTypesToTestIndex<dataTypesToTest.length; dataTypesToTestIndex++ )
        {
            if ( dataTypesToTest[ dataTypesToTestIndex ] == currentNodeDataType ) break;
        }
        // If not the correct type, move to the next item
        if ( dataTypesToTestIndex >= dataTypesToTest.length) continue;
                
        var hasPropertyReferenceType = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.HasProperty ) )[0];
        if ( hasPropertyReferenceType == null )
        {
            print ( "Test cannot be completed: HasProperty types not set in settings." );
            return;
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
            var valuePrecisionItem = null;
            for ( var n=0; n<browseResponse.Results.length; n++ )
            {
                for ( var r=0; r<browseResponse.Results[n].References.length; r++ )
                {
                    if ( browseResponse.Results[n].References[r].BrowseName.Name == "ValuePrecision" )
                    {
                        valuePrecisionFound = true;
                        valuePrecisionItem = MonitoredItem.fromNodeIds( [browseResponse.Results[n].References[r].NodeId.NodeId] )[0];
                        break;
                    }
                }
                // Our work here is done if we have found the ValuePrecision property
                if ( valuePrecisionFound ) break;
            }
            
            // If ValuePrecision found
            if ( valuePrecisionFound )
            {
                addLog ( "ValuePrecision property found in node '" + monitoredItems[i].NodeSetting + "'. Next writing to this node." );
                
                // First read the value precision property and the value attribute
                if ( ReadHelper.Execute ( [ valuePrecisionItem, monitoredItems[i] ] ) == false )
                {
                    addError ( "Unable to read the ValuePrecision property of the node '" + monitoredItems[i].NodeSetting + "'." );
                    continue;
                }
                // record the initial value because we will revert to it after the test.
                monitoredItems[i].InitialValue = monitoredItems[i].Value.Value.clone();
                var precisionValue = valuePrecisionItem.Value.Value.toDouble ();

                // Now do a write to this node
                var writeValue = new UaVariant ();
                GenerateScalarValue ( writeValue, currentNodeDataType );
                monitoredItems[i].SafelySetValueTypeKnown( UaVariantToSimpleType ( writeValue ), currentNodeDataType );
    
                // Write the value
                if ( !WriteHelper.Execute( monitoredItems[i] ) )
                {                
                    addError( "Write failed for node: '" + monitoredItems[i].NodeSetting + "'." );
                    continue;
                }
                
                // Read (to verify written value)
                print ( "Reading node '" + monitoredItems[i].NodeSetting + "' after the write to check the written value." );
                var readMonitoredItem = MonitoredItem.fromSetting( monitoredItems[i].NodeSetting, 1 );            
                if ( ReadHelper.Execute ( readMonitoredItem ) )
                {
                    // Check: Value
                    print( "Checking the value..." );
                    var writeValue = UaVariantToSimpleType ( monitoredItems[i].Value.Value  );
                    var readValue  = UaVariantToSimpleType ( readMonitoredItem.Value.Value );                    
                    //if ( writeValue == readValue  )
                    var match = true;
                    if( writeValue !== readValue && writeValue !== readValue )
                    {
                        if( writeValue === null ){ writeValue = ""; }
                        if( readValue  === null ){ readValue = ""; }
                        if( writeValue.toString() !== readValue.toString() )
                        { 
                            match = false;
                        }
                    }
                    if (match)
                    {
                        if ( currentNodeDataType == BuiltInType.DateTime )
                        {
                            addLog ( "The expected and received value for the node '" + readMonitoredItem.NodeSetting + "' are the same (value = " + readValue + ")." );
                        }
                        else
                        {
                            AssertValueWithinPrecision( readValue, writeValue, precisionValue );
                        }
                    }
                    else
                    {
                        // The values are different, now check if the difference is within the range defined by the precision
                        if ( currentNodeDataType == BuiltInType.DateTime )
                        {
                            if ( Math.abs  ( readValue.diff ( writeValue ) ) <= precisionValue )
                            {
                                addLog ( "The received value does not match what was written..\n\tWrite value: " + writeValue + "\n\tReceived Value: " + readValue + "\nThe received value differs by the range specified by the precision (" + precisionValue + ")." );
                            }
                            else
                            {
                                addLog ( "The received value does not match what was written..\n\tWrite value: " + writeValue + "\n\tReceived Value: " + readValue + "\nHowever, the received value does not differ by the range specified by the precision (" + precisionValue + ")." );
                            }                            
                        }
                        // Double/Float
                        else
                        {
                            AssertValueWithinPrecision( readValue, writeValue, precisionValue );
                        }
                    }
                }
                else
                {
                    addError( "read() failed for node '" + readMonitoredItem.NodeSetting + "' with status '" + uaStatus + "'(while verifying the write)." );
                }
                // now revert back to the original value 
                print( "\n\n\tRerting item '" + monitoredItems[i].NodeSetting + "' to original value of: " + 
                    monitoredItems[i].InitialValue.toString() );
                monitoredItems[i].Value.Value = monitoredItems[i].InitialValue.clone();
                WriteHelper.Execute( monitoredItems[i] );
            }
            else
            {
                addSkipped( "Node '" + monitoredItems[0].NodeSetting + "' does not have the ValuePrecision property." );
            }
        }
        else
        {
            addError( "Browse(): status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( write614008 );