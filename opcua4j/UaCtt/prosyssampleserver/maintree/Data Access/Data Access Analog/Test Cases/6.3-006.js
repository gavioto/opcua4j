/*  Test 6.3 Test #6, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write the following 3 values to an analog node of each supported type:
        EURange.Low, EURange.High, and a number in the middle of the EURange.

    Revision History: 
        08-Feb-2010 Anand Taparia: Initial version.
        04-Mar-2010 NP: REVIEWED.
*/

function write613006()
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
        
        // Get the EURange for this analog node
        var analogNodeEURange = GetNodeIdEURange( writeMonitoredItem.NodeSetting );        
        // Does the item have an EURange defined?
        if( analogNodeEURange == null )
        {
            print( "EURange not defined for analog node '" + analogTypeNodes[i] + "'. Skipping node.");
            continue;
        }
        
        // EURange defined, continue with the test
        print ( "EURange property of analog node '" + analogTypeNodes[i] + "' is: " + analogNodeEURange );
        
        // Get the datatype of the current node we are processing
        var currentNodeDataType = NodeIdSettings.guessType( analogTypeNodes[i] ) ;
        
        // In this loop we write the three values for this test (in the order listed below)
        // 1) EURange.Low
        // 2) EURange.High
        // 3) No. in the middle of the EURange
        for ( var n=0; n<3; n++)
        {
            // Get the value we are writing
            switch (n)
            {
                // Low
                case 0:
                    writeMonitoredItem.SafelySetValueTypeKnown( analogNodeEURange.Low, currentNodeDataType );
                    print ( "Writing EURange.Low value: " + UaVariantToSimpleType( writeMonitoredItem.Value.Value ) );
                    break;                    
                // High
                case 1:
                    writeMonitoredItem.SafelySetValueTypeKnown( analogNodeEURange.High, currentNodeDataType );
                    print ( "Writing EURange.High value: " + UaVariantToSimpleType( writeMonitoredItem.Value.Value ) );
                    break;                    
                // Middle
                case 2:
                    var middleValue = ( analogNodeEURange.Low + GetEURangeAsSize( analogNodeEURange ) / 2 );
                    writeMonitoredItem.SafelySetValueTypeKnown( middleValue, currentNodeDataType );
                    print ( "Writing value in the middle of the EURange: " + UaVariantToSimpleType( writeMonitoredItem.Value.Value ) );
                    break;                    
            }

            // Write the value
            if( !WriteHelper.Execute( writeMonitoredItem ) )
            {                
                addError( "Write failed for node: '" + writeMonitoredItem.NodeSetting + "'." );
                continue;
            }
            
            // Read (to verify written value/type)
            print ( "Reading node '" + analogTypeNodes[i] + "' after the write to check the written values." );
            var readMonitoredItem = MonitoredItem.fromSetting( analogTypeNodes[i], 1 );            
            if ( ReadHelper.Execute ( readMonitoredItem ) )
            {
                // Check#1: DataType
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
                addError( "read() failed for node '" + readMonitoredItem.NodeSetting + "' with status '" + ReadHelper.readResponse.ResponseHeader.StatusCode + "'." );
            }
        }
    }
    // Test complete
    print ( "********************" );
    print ( "Test Complete." );
    print ( "********************" );    
}

safelyInvoke( write613006 );