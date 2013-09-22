/*  Test 6.3 Test 5 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        For an analog node that has EURange defined, write a value that exceeds the lower bound 
        (i.e. lowerbound - 1) and another value that exceeds the upperbound (i.e. upperbound + 1)

    Revision History
        09-Feb-2010 Anand Taparia: Initial version.
        04-Mar-2010 NP: REVIEWED.
        22-Dec-2010 NP: Test accepts "Good" result if server supports writing outside the EURange.
*/

function read613005()
{
    // Get handle to an analog node
    if( AnalogItems == null || AnalogItems.length == 0 )
    {
        addSkipped( "Static Analog" );
        return;
    }
    
    // Read the EURange property (interested in only a single analog node)
    var analognodeEURange = GetNodeIdEURange( AnalogItems[0].NodeSetting );
    if ( analognodeEURange == null )
    {
        addWarning( "EURange not defined for analog node '" + AnalogItems[0].NodeSetting + "'.");
        return;
    }
       
    // EURange defined, continue with the test
    print ( "EURange property of analog node '" + AnalogItems[0].NodeSetting + "' is: " + analognodeEURange );
    
    // Get datatype of the monitored item
    var analogNodeDataType = NodeIdSettings.guessType( AnalogItems[0].NodeSetting ) ;
    
    // Write values in this loop, in the order as below:
    // 1st write: exceeding the lower bound
    // 2nd write: exceeding the upper bound
    for ( var n=0; n<2; n++)
    {
        var writeValue = 0;
        if ( n == 0 )
        {
            writeValue = analognodeEURange.Low - 1;
            print ( "Writing value that exceeds the lower bound: " + writeValue );
        }
        else
        {
            writeValue = analognodeEURange.High + 1;
            print ( "Writing value that exceeds the upper bound: " + writeValue );
        }        
        // Set write value
        AnalogItems[0].SafelySetValueTypeKnown( writeValue, analogNodeDataType );        
        // Expected results
        var results = [];
        results[0] = new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange );
        results[0].addExpectedResult( StatusCode.UncertainEngineeringUnitsExceeded );
        results[0].addExpectedResult( StatusCode.Good );
        if( !WriteHelper.Execute( AnalogItems[0], results, true ) )
        {
            addError( "Write failed for item: " + AnalogItems[0].NodeSetting );
        }
    }
    
    // Test complete
    print ( "********************" );
    print ( "Test Complete." );
    print ( "********************" );    
}

safelyInvoke( read613005 );