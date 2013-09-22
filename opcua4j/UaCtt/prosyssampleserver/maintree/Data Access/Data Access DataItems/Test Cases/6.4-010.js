/*  Test 6.4 Test #10, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write a value to a dataitem node (of type Float/Double) that matches its ValuePrecision. 

    Revision History: 
        19-Feb-2010 Anand Taparia: Initial version.
        03-Mar-2010 NP: REVIEWED. Inconclusive.
*/

function write614010()
{
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem(), 1 );
    if ( monitoredItems.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }
    
    // Only these datatypes need to be tested (only these have ValuePrecision property)
    var dataTypesToTest = [ BuiltInType.Float, BuiltInType.Double ];
    
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
        
        // Get the nodeID of the "ValuePrecision" property
        var returnedNodeIds = getPropertyNodeId( g_session, monitoredItems[i].NodeId, "0:ValuePrecision" );
        
        // Did we actually find the property
        if( returnedNodeIds !== null && returnedNodeIds !== undefined )
        {
            if ( returnedNodeIds.length > 0)
            {
                AssertEqual ( returnedNodeIds.length, 1, "Expected a single nodeID from the translate operation on node '" + monitoredItems[i].NodeSetting + "'.");
                
                // Let's do the read first to get the precision value
                var precisionValue = 0.0;
                var readMonitoredItems = MonitoredItem.fromNodeIds ( returnedNodeIds );
                var results = [];
                results[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
                if ( ReadHelper.Execute ( readMonitoredItems[0], results, true ) == false )
                {
                    addError ( "read() failed for the 'ValuePrecision' property of the node '" + monitoredItems[i].NodeSetting + "'." );
                    return;
                }
                else
                {
                    // Get the value here
                    precisionValue = readMonitoredItems[0].Value.Value.toDouble ();
                }

                // Read the node to get the current value (this is not important for this test
                // but this way when we write a new value, it is pretty close to the existing value )
                var currentValue;
                if ( ReadHelper.Execute ( monitoredItems[i] ) == true )
                {
                    currentValue = UaVariantToSimpleType ( monitoredItems[i].Value.Value );
                }

                // Do the write
                var writeValue = generateValueWithPrecision ( precisionValue, currentValue );
                var writeMonitoredItem = MonitoredItem.fromSetting ( monitoredItems[i].NodeSetting, 1 ); 
                writeMonitoredItem.SafelySetValueTypeKnown( writeValue, currentNodeDataType );
                results = [];
                results[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
                results[0].addAcceptedResult ( StatusCode.BadUserAccessDenied );
                print ( "Writing value '" + UaVariantToSimpleType ( writeMonitoredItem.Value.Value ) + "'(matches the value precision) to node '" + monitoredItems[i].NodeSetting + "'." );
                if ( WriteHelper.Execute ( writeMonitoredItem, results, true ) == false)
                {
                    addError ( "write() failed for the node '" + writeMonitoredItem.NodeSetting + "'." );
                }
                else
                {
                    // Write succeeded, now read the value to verify
                    var readMonitoredItem = MonitoredItem.fromSetting ( monitoredItems[i].NodeSetting, 1 ); 
                    results = [];
                    results[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
                    print ( "Write succeeded, now reading the value to verify. The values should match." );
                    if ( ReadHelper.Execute ( readMonitoredItem, results, true ) == false)
                    {
                        addError ( "read() failed (after the write for verification) of the node '" + readMonitoredItem.NodeSetting + "'." );
                    }
                    else
                    {
                        // Since we wrote a value as per the ValuePrecision, we should read back exactly what we wrote!
                        var readValue = UaVariantToSimpleType ( readMonitoredItem.Value.Value );
                        var writeValue = UaVariantToSimpleType ( writeMonitoredItem.Value.Value );
                        if ( readValue !=  writeValue )
                        {
                            addError( "The received value does not match what was written.\n\tWrite value: " + writeValue + "\n\tReceived Value: " + readValue );
                        }
                        else
                        {
                            addLog( "The received value matches what was written(Value = " + readValue + ")." );
                        }
                    }                
                }
            }
            else
            {
                addLog( "The optional 'ValuePrecision' property not found in node '" + monitoredItems[i].NodeSetting + "'." );
            }
        }
        else
        {
            addLog( "The optional 'ValuePrecision' property not found in node '" + monitoredItems[i].NodeSetting + "'." );
        }
    }
}

safelyInvoke( write614010 );