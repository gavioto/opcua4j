/*  Test 6.4 Test 3 prepared by Anand Taparia; ataparia@kepware.com

    Description:
        Read value attribute of data item nodes of each of the following data types: 
        Byte, Double, Float, GUID, Int16, UInt16, Int32, UInt32, Int64, UInt64, SByte, String

    Revision History:
        18-Feb-2010 Anand Taparia: Initial version.
        03-Mar-2010 NP: REVIEWED.
        18-May-2010 DP: Fixed issue where the data type does not support "==".
                        Removed redundant warning.
        22-Jun-2010 DP: Fixed Read to use a MaxAge of 0.
*/

function read614003()
{
    // Get handle to dataitem nodes
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem (), 1 );
    if ( monitoredItems.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }

    // Test each of the data item one by one
    for ( var i=0; i<monitoredItems.length; i++ )
    {
        // Get the datatype of the current node we are processing
        currentNodeDataType = NodeIdSettings.guessType( monitoredItems[i].NodeSetting ) ;

        // We will preset a value, and then do a read
        var writeValueVariant = new UaVariant ();
        GenerateScalarValue( writeValueVariant, currentNodeDataType );
        var writeValue = UaVariantToSimpleType ( writeValueVariant );
        monitoredItems[i].SafelySetValueTypeKnown( writeValue, currentNodeDataType );
        print ( "\nPresetting for test: Writing value '" + UaVariantToSimpleType ( monitoredItems[i].Value.Value ) + "' to node '" + monitoredItems[i].NodeSetting + "'." );
        // Write 
        if ( WriteHelper.Execute ( monitoredItems[i] ) == false )
        {
            print ( "Unable to preset dataitem node '" + monitoredItems[i].NodeSetting + "' with a value. Skipping the node for this test." );
            continue;
        }

        // Node has been preset with a value at this point. Now do a read 
        var readMonitoredItem = MonitoredItem.fromSetting ( monitoredItems[i].NodeSetting, 1 );
        if ( ReadHelper.Execute ( readMonitoredItem, TimestampsToReturn.Neither, 0 ) == false )
        {
            addError ( "Unable to read dataitem node '" + monitoredItems[i].NodeSetting + "'." );
            continue;
        }

        // Read of the data item node successful, now verify the value/datatype
        // Check#1: DataType
        print( "Checking the data type..." );
        if ( currentNodeDataType == readMonitoredItem.DataType )
        {
            addLog ( "The expected and received datatype for the node '" + readMonitoredItem.NodeSetting + "' are the same(datatype = " + BuiltInType.toString ( currentNodeDataType ) + ")." );
        }
        else
        {
            addError ( "The expected and received datatype for the node '" + readMonitoredItem.NodeSetting + "' are the different.\n\t Expected datatype = " + BuiltInType.toString ( currentNodeDataType ) + "\n\t Received datatype = " + BuiltInType.toString ( readMonitoredItem.DataType ) + "" );
        }

        // Check#2: Value
        print( "Checking the value..." );
        var writeVal = UaVariantToSimpleType ( monitoredItems[i].Value.Value );
        var readVal  = UaVariantToSimpleType( readMonitoredItem.Value.Value );                    
        AssertEqual( writeVal, readVal, "The expected and received value for the node '" + readMonitoredItem.NodeSetting + "' are different." )
    }

    // Test complete
    print( "********************" );
    print( "Test Complete." );
    print( "********************" );    
}

safelyInvoke( read614003 );