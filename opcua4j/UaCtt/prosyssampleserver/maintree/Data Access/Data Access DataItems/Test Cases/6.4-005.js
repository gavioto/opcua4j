/*  Test 6.4 Test #5, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write to multiple dataitem nodes (of all supported datatypes) in a single call 
        max value of the corresponding datatype.

    Revision History: 
        19-Feb-2010 Anand Taparia: Initial Version.
        03-Mar-2010 NP: REVIEWED.
        22-Jun-2010 DP: Fixed Read to use a MaxAge of 0.
*/

function write614005 ()
{
    // Get the dataitem nodes for this test
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem (), 1 );
    if ( monitoredItems.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }

    // Check that we are covering all the data types as required by this test
    if ( monitoredItems.length < NodeIdSettings.DAAStaticDataItem().length )
    {
        // Post a warning message, but continue
        addWarning( "\nNot all the datatypes are being covered by this test. Add additional DataItem nodes." );
    }

    // Fill write parameters for each node
    var nRunningIndex = 0;
    var writeMonitoredItems = [];        // Items that we will write to
    var readMonitoredItems = [];         // Items that we will read (to verify) after the write    
    var writeResults = [];
    for ( var i=0; i<monitoredItems.length; i++ )
    {
        // Get the datatype of the current node we are processing
        currentNodeDataType = NodeIdSettings.guessType( monitoredItems[i].NodeSetting ) ;   
        
        // Get value to write
        var writeValue = getMaxValueDataType ( currentNodeDataType );
        monitoredItems[i].SafelySetValueTypeKnown( writeValue, currentNodeDataType );
        print ( "Adding dataitem node '" + monitoredItems[i].NodeSetting + "' for write. Write value(max of datatype): " + UaVariantToSimpleType ( monitoredItems[i].Value.Value ) + "." );
        
        // Expected write result for this monitored item
        writeResults[nRunningIndex] = new ExpectedAndAcceptedResults( StatusCode.Good );
        
        // Save this monitored item to our array
        writeMonitoredItems[nRunningIndex] = monitoredItems[i];
        readMonitoredItems[nRunningIndex] = monitoredItems[i];
        nRunningIndex++;
    }
    
    // Perform the single write
    print ( "Peforming a single write of all the above dataitem nodes." );
    if( WriteHelper.Execute( writeMonitoredItems, writeResults, true ) == false )
    {
        addError ( "Write failed for the dataitem nodes." );
        return;
    }
    
    // Now perform a read (to validate the values written)
    print ( "Reading the dataitem nodes after the write to check the written values." );
    if ( ReadHelper.Execute ( readMonitoredItems, TimestampsToReturn.Neither, 0 ) == false)
    {
        addError ( "Read (to verify the write values) failed of the dataitem nodes." );
        return;
    }
    
    // Verify the reads match the writes
    for( var i=0; i<readMonitoredItems.length; i++ )
    {
        print ( "Verifying node '" + readMonitoredItems[i].NodeSetting + "'..." );
        // Check: Value
        addLog( "Checking the value..." );
        var writeVal = UaVariantToSimpleType ( writeMonitoredItems[i].Value.Value );
        var readVal  = UaVariantToSimpleType ( readMonitoredItems[i].Value.Value );
        if ( AssertEqual( writeVal, readVal, ( "The expected and received value for the node '" + readMonitoredItems[i].NodeSetting + "' are the different.\n\t Expected value = " + writeVal + "\n\t Received value = " + readVal + "" ) ) )
        {
            addLog ( "The expected and received value for the node '" + readMonitoredItems[i].NodeSetting + "' are the same (value = " + readVal + ")." );
        }
    }
    // Test complete
    print( "********************" );
    print ( "Test Complete." );
    print ( "********************" );    
}

safelyInvoke( write614005 );