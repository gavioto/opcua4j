/*  Test 6.3 Test #7, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write the following 3 values to an analog node of each supported type:
        Min of datatype, Max of datatype, and a number in the middle of the datatype range.

    Revision History: 
        08-Feb-2010 Anand Taparia: Initial Version.
        07-Mar-2010 Anand Taparia: Skipping nodes that have an EURange defined. 
*/

function write613007()
{
    // Analog type nodes array
    var analogTypeNodes = NodeIdSettings.DAStaticAnalog();

    // Check that we are covering all the data types as required by this test
    if ( analogTypeNodes.length < 8 )
    {
        // Post a warning message, but continue
        print ( "\nNot all the datatypes are being covered by this test. Add additional analog items." );
    }

    // Test each of the analog item one by one
    for( var i=0; i<analogTypeNodes.length; i++ )
    {
        // Get the value of the setting, and make sure it contains a value
        var writeMonitoredItem = MonitoredItem.fromSetting( analogTypeNodes[i], 1 );
        if( writeMonitoredItem == null )
        {
            print ( "Unable to test node: " + analogTypeNodes[i] + ". Invalid setting." );
            continue;
        }
        
        // If this node has an EURange, we will skip the node
        // Reason being any of the writes could be outside the range and hence fail.
        var analogNodeEURange = GetNodeIdEURange( writeMonitoredItem.NodeSetting );
        if ( analogNodeEURange != null)
        {
            print ( "Skipping node '" + writeMonitoredItem.NodeSetting + "' as it has an EURange defined." );
            continue;
        }
        
        // Get the datatype of the current node we are processing
        var currentNodeDataType = NodeIdSettings.guessType( analogTypeNodes[i] ) ;        
        // We are not interested in datatype 'Byte' for this test
        if ( currentNodeDataType == BuiltInType.Byte ) continue;
        
        // In this loop we write the three values for this test (in the order listed below)
        // 1) Max value of datatype
        // 2) Min value of datatype
        // 3) Value in the middle of the datatype range
        for ( var n=0; n<3; n++)
        {
            // Get the value we are writing
            var writeValue = 0;
            switch (n)
            {
                // Max
                case 0:
                    writeValue = getMaxValueDataType ( currentNodeDataType );
                    writeMonitoredItem.SafelySetValueTypeKnown( writeValue, currentNodeDataType );
                    print ( "Writing max datatype('" + BuiltInType.toString ( currentNodeDataType ) + "') value of '" + UaVariantToSimpleType( writeMonitoredItem.Value.Value ) + "'to analog node '" + analogTypeNodes[i] + "'." );
                    break;
                // Min
                case 1:
                    writeValue = getMinValueDataType ( currentNodeDataType );
                    writeMonitoredItem.SafelySetValueTypeKnown( writeValue, currentNodeDataType );
                    print ( "Writing min datatype('" + BuiltInType.toString ( currentNodeDataType ) + "') value of '" + UaVariantToSimpleType( writeMonitoredItem.Value.Value ) + "'to analog node '" + analogTypeNodes[i] + "'." );
                    break;
                // Middle
                case 2:
                    writeValue = getMiddleValueDataType ( currentNodeDataType );
                    writeMonitoredItem.SafelySetValueTypeKnown( writeValue, currentNodeDataType );
                    print ( "Writing value in the middle of the datatype('" + BuiltInType.toString ( currentNodeDataType ) + "') range: '" + UaVariantToSimpleType( writeMonitoredItem.Value.Value ) + "'to analog node '" + analogTypeNodes[i] + "'." );
                    break;
            }

            // Write value
            var results = [];
            results[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
            if( WriteHelper.Execute( writeMonitoredItem, results, true ) == false )
            {
                addWarning ( "Write failed for node: '" + writeMonitoredItem.NodeSetting + "'." );
                continue;
            }
            
            // Read (to verify written value/type)
            print ( "Reading node '" + analogTypeNodes[i] + "' after the write to check the written values." );
            var readMonitoredItem = MonitoredItem.fromSetting( analogTypeNodes[i], 1 );            
            if ( ReadHelper.Execute ( readMonitoredItem ) )
            {
                // Check#1: DataType
                var currentNodeDataType = NodeIdSettings.guessType ( analogTypeNodes[i] );
                print( "Checking the data type..." );
                if ( currentNodeDataType == readMonitoredItem.DataType )
                {
                    addLog ( "The expected and received datatype for the node '" + analogTypeNodes[i] + "' are the same(datatype = " + BuiltInType.toString ( currentNodeDataType ) + ")." );
                }
                else
                {
                    addError ( "The expected and received datatype for the node '" + analogTypeNodes[i] + "' are the different.\n\t Expected datatype = " + BuiltInType.toString ( currentNodeDataType ) + "\n\t Received datatype = " + BuiltInType.toString ( readMonitoredItem.DataType ) + "" );
                }
                
                // Check#2: Value
                print( "Checking the value..." );
                var writeVal = UaVariantToSimpleType ( writeMonitoredItem.Value.Value  );
                var readVal  = UaVariantToSimpleType ( readMonitoredItem.Value.Value );                    
                if ( writeVal == readVal  )
                {
                    addLog ( "The expected and received value for the node '" + analogTypeNodes[i] + "' are the same(value = " + readVal + ")." );
                }
                else
                {
                    addError ( "The expected and received value for the node '" + analogTypeNodes[i] + "' are the different.\n\t Expected value = " + writeVal + "\n\t Received value = " + readVal + "" );
                }
            }
            else
            {
                addError( "Read() failed for node '" + readMonitoredItem.NodeSetting + "'." );
            }
        }
    }
    // Test complete
    print ( "********************" );
    print ( "Test Complete." );
    print ( "********************" );    
}

safelyInvoke( write613007 );