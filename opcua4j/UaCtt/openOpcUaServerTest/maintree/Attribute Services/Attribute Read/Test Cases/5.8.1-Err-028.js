/*  Test 5.8.1 Error Test 28; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read a Node of each basic core Array data type. Specify an IndexRange that is 
        invalid, i.e. "2-4" (the '-' symbol is invalid).

        We expect operation level results of: Bad_IndexRangeInvalid.

    Revision History
        24-Sep-2009 NP: Initial version.
        11-Nov-2009 NP: Revised to use new Script library objects.
        11-Nov-2009 NP: REVIEWED.
        16-Nov-2009 DP: Removed error throws when the nodeSetting is not set.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function readArray581Err028( nodeSetting, nodeType )
{
    print( "\n\n********** Testing Type: " + BuiltInType.toString( nodeType ) + " **********" );
    var item = nodeSetting;
    if( item == null )
    {
        return;
    }
    item.AttributeId = Attribute.Value;
    item.IndexRange = "2-4";
    item.Value = generateArrayWriteValue( 0, 7, nodeType );
    readInvalidRangeOfArray( item, g_session );
}

function read581Err028()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0 );
    if( items === null || items.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }
    for( var i=0; i<items.length; i++ )
    {
        readArray581Err028( items[i], NodeIdSettings.guessType( items[i].NodeSetting ) );
    }
}

safelyInvoke( read581Err028 );