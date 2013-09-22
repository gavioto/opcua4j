/*  Test 5.8.1 Error Test 29; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read a Node of each basic core Array data type. Specify an IndexRange that is 
        invalid, i.e. "2:2" (not a range).

        We expect operation level results of: Bad_IndexRangeInvalid.

    Revision History
        24-Sep-2009 NP: Initial version.
        11-Nov-2009 NP: Revised to use new Script library objects. Also corrected the IndexRange.
        11-Nov-2009 NP: REVIEWED.
        16-Nov-2009 DP: Removed error throws when the nodeSetting is not set.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.

         The NumericRange type (IndexRange) is in Part 4 Section 7.21 which specifies
         that a range of "x:x" is not valid, it must be at least "x:x+1".
*/

function readArray581Err029( nodeSetting, nodeType )
{
    print( "\n\n********** Testing Type: " + BuiltInType.toString( nodeType ) + " **********" );
    var item = nodeSetting;
    if( item == null )
    {
        return;
    }
    item.AttributeId = Attribute.Value;
    item.IndexRange = "2:2";
    item.Value = generateArrayWriteValue( 0, 2, nodeType );
    readInvalidRangeOfArray( item, g_session );
}

function read581Err029()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0 );
    if( items === null || items.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }
    for( var i=0; i<items.length; i++ )
    {
        readArray581Err029( items[i], NodeIdSettings.guessType( items[i].NodeSetting ) );
    }
}

safelyInvoke( read581Err029 );