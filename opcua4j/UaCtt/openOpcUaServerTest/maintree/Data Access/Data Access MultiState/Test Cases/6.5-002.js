/*  Test 6.5 Test 2; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Read multiple nodes of this type and display the value. Verify the value is in the 
        EnumStrings Variable, i.e. numeric value is within the bounds of the EnumStrings array.
    Expectations:
        All service and operation level results are Good.

    Revision History:
        18-Feb-2010 NP: Initial version.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read65002()
{
    // read the node and display the Value
    if( ReadHelper.Execute( multiStateItems ) )
    {
        for( i=0; i<multiStateItems.length; i++ )
        {
            AssertEqual( BuiltInType.toString( BuiltInType.UInt32 ), BuiltInType.toString( multiStateItems[i].Value.Value.DataType ), "Data Type of .Value attribute should be UInteger, but is: " + BuiltInType.toString( multiStateItems[i].Value.Value.DataType ) );
            print( "\tRead complete of Node: " + multiStateItems[i].NodeSetting + "\n\t\tItem value: " + multiStateItems[i].Value.Value.toBoolean() );
            
            // we have the main node itself, now to get the TrueState and FalseState into a Node 
            var multiStateEnum = GetMultiStateDiscreteEnumStrings( multiStateItems[i].NodeSetting, g_session, ReadHelper );
            if( multiStateEnum !== null )
            {
                var msValue = multiStateItems[i].Value.Value.toUInt32();
                if( msValue > multiStateEnum.length )
                {
                    addLog( "\Read NodeID: " + multiStateItems[i].NodeId + ", value received is greater than defined bounds: Value=" + msValue + "; Bound Size=" + multiStateEnum.length + "; EnumValues are: '" + multiStateEnum + "'" );
                    addNotSupported( "Server does not restrict the value of an Enum to stay within the bounds of the Array. This is legal. " );
                }
                else
                {
                    addLog( "\tRead:\n\t\tNodeId '" + multiStateItems[i].NodeId + "' (setting: '" + multiStateItems[i].NodeSetting + "')\n\t\tValue: " + multiStateItems[i].Value.Value + ";\n\t\tEnumerated translation: " + msValue );
                }
            }
        }
    }
}

safelyInvoke( read65002 );