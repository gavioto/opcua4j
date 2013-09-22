/*  Test 5.8.1 Error Test 31; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read a Node of each basic core Array data type. Specify an IndexRange that is 
        outside the bounds of the array, i.e.

        lower bound = upper bound + 1
        upper bound = upper bound + 5

    Revision History
        24-Sep-2009 NP: Initial version.
        11-Nov-2009 NP: Revised to use new Script library objects.
        11-Nov-2009 NP: REVIEWED.
        16-Nov-2009 DP: Removed error throws when the nodeSetting is not set.
        25-Jan-2010 NP: Corrected the expected StatusCode based on the test-case requirements.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.

     HOW THIS SCRIPT WORKS:
         1. Read the raw array value.
         2. Read the array value specifying the IndexRange +1 to +5 over the range.
         3. REPEAT FOR EACH DATA TYPE.
*/

function readArray581Err031( nodeSetting, nodeType )
{
    print( "\n\n********** Testing Type: " + BuiltInType.toString( nodeType ) + " **********" );
    var item = nodeSetting;
    item.AttributeId = Attribute.Value;
    if( item == null )
    {
        return;
    }
    item.Value = generateArrayWriteValue( 0, 1, nodeType );

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        STEP 1) INITIAL READING OF WHOLE ARRAY.
    */
    if( ReadHelper.Execute( item ) )
    {
        // check the data type
        var valueAsArray = GetArrayTypeToNativeType( ReadHelper.readResponse.Results[0].Value );
        var arraySize;
        // is this an array type or a ByteString?
        if( ReadHelper.readResponse.Results[0].Value.ArrayType === 1 )
        {
            // array
            arraySize = ReadHelper.readResponse.Results[0].Value.getArraySize();
        }
        else
        {
            // bytestring?
            if( ReadHelper.readResponse.Results[0].Value.DataType == BuiltInType.ByteString )
            {
                arraySize = ReadHelper.readResponse.Results[0].Value.toByteString().length;
            }
        }
        if( AssertGreaterThan( 2, arraySize, "Expect 3 or more elements in the array." ) )
        {
            var outOfBoundsIndexRange = "" + ( valueAsArray.length + 1 ) + ":" + ( valueAsArray.length + 5 );
            item.IndexRange = outOfBoundsIndexRange;

            print( "Reading ARRAY node: '" + item.NodeId + "' Upper bound is: " + valueAsArray.length + ". Out of bounds indexRange will be: " + outOfBoundsIndexRange );
            var expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeNoData ) ];
            ReadHelper.Execute( item, undefined, undefined, expectedResults, true );
        }// if moveOntoSecondRead
    }
}// function

function read581Err031()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0 );
    if( items === null || items.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }
    for( var i=0; i<items.length; i++ )
    {
        readArray581Err031( items[i], NodeIdSettings.guessType( items[i].NodeSetting ) );
    }
}

safelyInvoke( read581Err031 );