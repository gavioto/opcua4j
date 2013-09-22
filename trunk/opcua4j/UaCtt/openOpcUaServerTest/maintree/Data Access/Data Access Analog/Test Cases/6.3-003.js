/*  Test 6.3 Test 3 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Read the EURange property of an analog node.

    Revision History
        09-Feb-2010 Anand Taparia: Initial version.
        04-Mar-2010 NP: REVIEWED.
*/

function read613003()
{
    // Get handle to an analog node
    if( AnalogItems == null || AnalogItems.length == 0 )
    {
        addSkipped( "Static Analog" );
        return;
    }

    // Read the EURange property of a single analog node
    var analogNodeEURange = GetNodeIdEURange( AnalogItems[0].NodeSetting );
    if ( analogNodeEURange != null)
    {
        addLog( "EURange property of analog node '" + AnalogItems[0].NodeSetting + "' is: " + analogNodeEURange );
    }
    else
    {
        addError( "Unable to read the EURange property of the analog node '" + AnalogItems[0].NodeSetting + "'." );
    }
    
    // Test complete
    print ( "********************" );
    print ( "Test Complete." );
    print ( "********************" );    
}

safelyInvoke( read613003 );