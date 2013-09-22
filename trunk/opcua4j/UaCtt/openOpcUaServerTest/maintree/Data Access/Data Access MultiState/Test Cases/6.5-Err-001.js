/*  Test 6.5 Error Test 1; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Write a value (Value attribute) that exceeds the bounds of the EnumStrings attribute.

    Expectations:
        ServiceResult = Good. Operation level result is Bad_OutOfRange.

    Revision History:
        08-Mar-2010 NP: Initial version.
        26-Aug-2010 NP: Reverts to the original value after the test.

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

            //record the initial value so that we can revert back to it after the test
            multiStateItems[0].InitialValue = multiStateItems[0].Value.Value.clone();

            // now write a value that exceeds the bounds of the enum
            multiStateItems[0].SafelySetValueTypeKnown( ( multiStateEnum.length + 1 ), multiStateItems[0].Value.Value.DataType );

            var expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
            expectedResults[0].addAcceptedResult( StatusCode.BadOutOfRange );
            WriteHelper.Execute( multiStateItems[0], expectedResults, true );

            // now revert to the original value
            multiStateItems[0].Value.Value = multiStateItems[0].InitialValue.clone();
            expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
            WriteHelper.Execute( multiStateItems[0], expectedResults, true );
        }
    }
}

safelyInvoke( readErr65001 );