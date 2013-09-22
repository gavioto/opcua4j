/*  Test 6.5 Test 3; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Go into a loop writing a value (Value attribute) to the Node. Each iteration of
        the loop should write the “next” value within the EnumStrings attribute. For example:
            For( var i=0; i<EnumStrings.length; i++ )
            Write( i );    
        After each Write, read the value back.

    Expectations:
        All service and operation level results are Good. 
        Compare the value received in the Read to the value Written.

    Revision History:
        18-Feb-2010 NP: Initial version.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read65003()
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
            //record the initial value so that we can revert back to it after the test
            multiStateItems[0].InitialValue = multiStateItems[0].Value.Value.clone();

            print( "\n********* Now to write each value as supported by the enum ***********" );
            print( "There are " + multiStateEnum.length + " element(s), each will be tested." );

            for( var w=0; w<multiStateEnum.length; w++ )
            {
                multiStateItems[0].Value.Value.setUInt32( w );
                if( AssertTrue( WriteHelper.Execute( multiStateItems[0] ), "Aborting test because Write failed!" ) )
                {
                    if( ReadHelper.Execute( multiStateItems[0] ) )
                    {
                        print( "\tRead:\n\t\tNodeId '" + multiStateItems[0].NodeId + "' (setting: " + multiStateItems[0].NodeSetting + ")" +
                            "\n\t\tValue: " + multiStateItems[0].Value.Value + 
                            ";\n\t\tEnumerated translation: " + multiStateEnum[multiStateItems[0].Value.Value.toUInt32()] );
                    }
                }
                else
                {
                    break;
                }
            }//for w...

            // now revert to the original value
            multiStateItems[0].Value.Value = multiStateItems[0].InitialValue.clone();
            expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
            WriteHelper.Execute( multiStateItems[0], expectedResults, true );
        }//multiState != null
    }//read success
}

safelyInvoke( read65003 );