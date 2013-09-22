/*  Test 6.6 Test 1; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Read a node and read the values of both the TrueState and FalseState attributes.
        Do this twice, once where the value is TRUE and then where the value is FALSE.
    Expectations:
        Service and operation level results are Good for the Value (attribute) and the
        two Variables (TrueState and FalseState).

    Revision History:
        16-Feb-2010 NP: Initial version.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read66001()
{
    if( twoStateItems == null || twoStateItems.length == 0 )
    {
        addSkipped( TSDT );
        return;
    }

    // read the node and display the Value
    if( ReadHelper.Execute( twoStateItems[0] ) )
    {
        AssertEqual( BuiltInType.toString( BuiltInType.Boolean ), BuiltInType.toString( twoStateItems[0].Value.Value.DataType ), "Data Type of .Value attribute should be Boolean!" );
        print( "\tRead complete of Node: " + twoStateItems[0].NodeSetting + "\n\t\tItem value: " + twoStateItems[0].Value.Value.toBoolean() );
        
        // we have the main node itself, now to get the TrueState and FalseState into a Node 
        var trueFalseState = null;
        trueFalseState = GetTrueStateFalseState( twoStateItems[0].NodeSetting, g_session, ReadHelper );
        if( trueFalseState !== null )
        {
            AssertNotNullOrEmpty( trueFalseState.TrueState.Value, "A TrueState is Required" );
            AssertNotNullOrEmpty( trueFalseState.TrueStateLocalized.Text, "A TrueState Text is required." );
            AssertNotNullOrEmpty( trueFalseState.FalseState.Value, "A FalseState is Required" );
            AssertNotNullOrEmpty( trueFalseState.FalseStateLocalized.Text, "A FalseState Text is Required" );
        }
    }
}

safelyInvoke( read66001 );