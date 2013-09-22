/*  Test 6.5 Error Test 2; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Write the intended value as a String, e.g. 2 is sent as “2”.

    Expectations:
        Service result = Good, and operation level result is Bad_TypeMismatch.

    Revision History:
        08-Mar-2010 NP: Initial version.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function readErr65001()
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
            addLog( "There are " + multiStateEnum.length + " element(s), now to write a value that exceeds the bound (bound + 1 )." );

            multiStateItems[0].Value.Value.setString( ( multiStateEnum.length + 1 ).toString() );

            var expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch ) ];
            WriteHelper.Execute( multiStateItems[0], expectedResults, true );
        }
    }
}

safelyInvoke( readErr65001 );