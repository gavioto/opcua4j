/*  Test 6.3 Test 4 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Read the EURange property of multiple analog nodes.

    Revision History
        09-Feb-2010 Anand Taparia: Initial version.
        04-Mar-2010 NP: REVIEWED.
*/

function read613004()
{
    // Get handle to analog nodes
    if( AnalogItems == null || AnalogItems.length < 2 )
    {
        addSkipped( "Static Analog" );
        return;
    }
    
    // Read the EURange property of the analog nodes
    var analogNodeEURange;
    for ( var i=0; i<AnalogItems.length; i++)
    {
        analogNodeEURange = GetNodeIdEURange( AnalogItems[i].NodeSetting );
        if ( analogNodeEURange != null)
        {
            addLog( "EURange property of analog node '" + AnalogItems[i].NodeSetting + "' is: " + analogNodeEURange );
        }
        else
        {
            addError( "Unable to read the EURange property of the analog node '" + AnalogItems[i].NodeSetting + "'." );
        }
    }
    
    // Test complete
    print ( "********************" );
    print ( "Test Complete." );
    print ( "********************" );    
}

safelyInvoke( read613004 );