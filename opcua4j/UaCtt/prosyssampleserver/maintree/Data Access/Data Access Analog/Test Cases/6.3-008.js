/*  Test 6.3 Test #8, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write to multiple analog nodes (of all supported datatypes) in a single call 
        values in the middle of the corresponding datatype range.

    Revision History: 
        08-Feb-2010 Anand Taparia: Initial Version.
        04-Mar-2010 NP: REVIEWED. INCORRECT. Writing to Nodes that have EURange's which causes a FAIL.
        07-Mar-2010 Anand Taparia: Skipping nodes that have an EURange defined. 
*/

function write613008()
{
    // Get the analog nodes for this test
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAStaticAnalog(), 1 );
    if( monitoredItems.length == 0 )
    {
        addSkipped( "Static Analog" );
        return;
    }

    // Check that we are covering all the data types as required by this test
    if ( monitoredItems.length < 8 )
    {
        // Post a warning message, but continue
        print ( "\nNot all the datatypes are being covered by this test. Add additional analog items." );
    }

    // Fill write parameters for each node
    var nRunningIndex = 0;
    var writeMonitoredItems = [];        // Items that we will write to
    var readMonitoredItems = [];        // Items that we will read (to verify) after the write    
    var writeResults = [];
    for( var i=0; i<monitoredItems.length; i++ )
    {
        // Get the datatype of the current node we are processing
        currentNodeDataType = NodeIdSettings.guessType( monitoredItems[i].NodeSetting ) ;   
        // We are not interested in datatype 'Byte' for this test
        if ( currentNodeDataType == BuiltInType.Byte ) continue;
        
        // If this node has an EURange, we will skip the node
        // Reason being any of the writes could be outside the range and hence fail.
        var analogNodeEURange = GetNodeIdEURange( monitoredItems[i].NodeSetting );
        if ( analogNodeEURange != null)
        {
            print( "Skipping node '" + monitoredItems[i].NodeSetting + "' as it has an EURange defined." );
            continue;
        }        
        
        // Get value to write
        var writeValue = getMiddleValueDataType ( currentNodeDataType );
        monitoredItems[i].SafelySetValueTypeKnown( writeValue, currentNodeDataType );
        print( "Adding analog node '" + monitoredItems[i].NodeSetting + "' for write. Write value(in the middle of the datatype range): " + UaVariantToSimpleType ( monitoredItems[i].Value.Value ) + "." );
        
        // Expected write result for this monitored item
        writeResults[nRunningIndex] = new ExpectedAndAcceptedResults( StatusCode.Good );
        
        // Save this monitored item to our array
        writeMonitoredItems[nRunningIndex] = monitoredItems[i];
        readMonitoredItems[nRunningIndex] = monitoredItems[i];
        nRunningIndex++;
    }
    
    // If we don't have any items to write to, our work here is done!
    if( nRunningIndex == 0 ) return;    
    
    // Perform the single write
    print( "Peforming a single write of all the above analog nodes." );
    if( WriteHelper.Execute( writeMonitoredItems, writeResults, true ) == false )
    {
        addError( "Write failed for the analog nodes." );
        return;
    }
    
    // Now perform a read (to validate the values written)
    print( "Reading the analog nodes after the write to check the written values." );
    if ( ReadHelper.Execute( readMonitoredItems ) == false)
    {
        addError ( "Read (to verify the write values) failed of the analog nodes." );
        return;
    }
    
    // Verify the reads match the writes
    for( var i=0; i<readMonitoredItems.length; i++ )
    {
        print ( "Verifying node '" + readMonitoredItems[i].NodeSetting + "'..." );
        // Check#1: DataType
        addLog( "Checking the data type..." );
        if ( writeMonitoredItems[i].DataType == readMonitoredItems[i].DataType )
        {
            addLog( "The expected and received datatype for the node '" + readMonitoredItems[i].NodeSetting + "' are the same(datatype = " + BuiltInType.toString ( readMonitoredItems[i].DataType ) + ")." );
        }
        else
        {
            addError( "The expected and received datatype for the node '" + readMonitoredItems[i].NodeSetting + "' are the different.\n\t Expected datatype = " + BuiltInType.toString ( writeMonitoredItems[i].DataType ) + "\n\t Received datatype = " + BuiltInType.toString ( readMonitoredItems[i].DataType ) );
        }
        
        // Check#2: Value
        addLog( "Checking the value..." );
        var writeVal = UaVariantToSimpleType ( writeMonitoredItems[i].Value.Value );
        var readVal  = UaVariantToSimpleType ( readMonitoredItems[i].Value.Value );
        if ( writeVal == readVal  )
        {
            addLog( "The expected and received value for the node '" + readMonitoredItems[i].NodeSetting + "' are the same(value = " + readVal + ")." );
        }
        else
        {
            addError( "The expected and received value for the node '" + readMonitoredItems[i].NodeSetting + "' are the different.\n\t Expected value = " + writeVal + "\n\t Received value = " + readVal + "" );
        }
    }
    // Test complete
    print( "********************" );
    print ( "Test Complete." );
    print ( "********************" );    
}

safelyInvoke( write613008 );