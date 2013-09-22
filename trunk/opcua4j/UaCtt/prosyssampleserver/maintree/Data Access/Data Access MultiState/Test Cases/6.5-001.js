/*  Test 6.5 Test 1; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Read a node of this type and display the value. Verify the value is in the 
        EnumStrings Variable, i.e. numeric value is within the bounds of the EnumStrings array.
    Expectations:
        All service and operation level results are Good.

    Revision History:
        18-Feb-2010 NP: Initial version.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read65001()
{
    // read the node and display the Value
    if( ReadHelper.Execute( multiStateItems[0] ) )
    {
        AssertEqual( BuiltInType.toString( BuiltInType.UInt32 ), BuiltInType.toString( multiStateItems[0].Value.Value.DataType ), "Data Type of .Value attribute should be UInteger, but is: " + BuiltInType.toString( multiStateItems[0].Value.Value.DataType ) );
        print( "\tRead complete of Node: " + multiStateItems[0].NodeSetting + "\n\t\tItem value: " + multiStateItems[0].Value.Value.toBoolean() );
        
        // we have the main node itself, now to get the TrueState and FalseState into a Node 
        var multiStateEnum = GetMultiStateDiscreteEnumStrings( multiStateItems[0].NodeSetting, g_session, ReadHelper );
        if( multiStateEnum !== null )
        {
            print( "\tRead:\n\t\tNodeId '" + multiStateItems[0].NodeId + "' (setting: " + multiStateItems[0].NodeSetting + ")\n\t\tValue: " + multiStateItems[0].Value.Value + ";\n\t\tEnumerated translation: " + multiStateEnum[multiStateItems[0].Value.Value.toUInt32()] );
        }
    }
}

safelyInvoke( read65001 );