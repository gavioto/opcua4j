/*  Test 5.8.1 Test 27; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read a single attribute from a valid node where the type is 
        an array data type, but specify an indexRange that will retrieve the
        2nd through 4th element only.

    Revision History
        22-Sep-2009 NP: Initial version.
        11-Nov-2009 NP: Revised to use new Script library objects.
        11-Nov-2009 NP: REVIEWED/INCONCLUSIVE. UA Server doesn't support IndexRange.
        16-Nov-2009 DP: Removed error throws when the nodeSetting is not set.
        01-Dec-2009 DP: Prepopulate the entire array (instead of a specific range). 
        31-Mar-2010 NP: Improved ByteString vs ByteString[] handling.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.

     HOW THIS SCRIPT WORKS:
         1. Read the raw array value.
         2. Read the array value specifying the IndexRange 2-4.
         3. Compare the value of the 2nd read matches elements #2, #3 and #4
            of the first read.
         4. REPEAT FOR EACH DATA TYPE.
*/

function readArray581027( nodeSetting, nodeType )
{
    const MIN_ARRAY_SIZE = 5;

    print( "\nTESTING TYPE: " + BuiltInType.toString( nodeType ) + "\nSETTING: " + nodeSetting );
    print( "-------------------------------------------------------------------" );
    var item = MonitoredItem.fromSetting( nodeSetting, 0, Attribute.Value, ("0:" + MIN_ARRAY_SIZE) );
    if( item == null )
    {
        return;
    }
    item.Value.Value = generateArrayWriteValue( 0, MIN_ARRAY_SIZE, nodeType );
    item.IndexRange = "";


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    print( "\n\n\nSTEP 1) INITIAL READING OF WHOLE ARRAY.\n" );
    var readArray;
    if( ReadHelper.Execute( item, TimestampsToReturn.Both ) )
    {
        // store the array value, because we'll compare against it later...
        var valueAsArray = GetArrayTypeToNativeType( ReadHelper.readResponse.Results[0].Value );

        // check the data type
        var moveOntoSecondRead = true;
        if( nodeType == BuiltInType.ByteString || ReadHelper.readResponse.Results[0].Value.DataType == BuiltInType.ByteString )
        {
            moveOntoSecondRead = AssertGreaterThan( MIN_ARRAY_SIZE - 1, valueAsArray.length, "Array too short. Needs to be at least 5 characters long. Node '" + item.NodeId + "' on setting '" + nodeSetting + "'" );
        }
        else
        {
            AssertEqual( 1, ReadHelper.readResponse.Results[0].Value.ArrayType, "Expected an Array type." );
            moveOntoSecondRead = AssertGreaterThan( MIN_ARRAY_SIZE - 1, ReadHelper.readResponse.Results[0].Value.getArraySize(), "Array too short. Needs to be at least 5 elements long. Node '" + item.NodeId + "' on setting '" + nodeSetting + "'" );
        }
        if( moveOntoSecondRead )
        {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            print( "\n\n\nSTEP 2) READING ARRAY SPECIFYING AN INDEX RANGE TO RETREIVE THE 2ND/3RD ELEMENT OF THE ARRAY ONLY.\n" );
            item.IndexRange = "2:4";
            if( ReadHelper.Execute( item, TimestampsToReturn.Both ) )
            {
                // depending upon the data-type, we will either do an element-by-element
                // check, or a string compare
                if( nodeType == BuiltInType.ByteString || ReadHelper.readResponse.Results[0].Value.DataType == BuiltInType.ByteString )
                {
                    // we need to treat ByteString differently to ByteString[]
                    if( ReadHelper.readResponse.Results[0].Value.ArrayType === 1 )
                    {
                        // bytestring[]
                        // check that array elements 2-4 are equal
                        var newValueAsArray = GetArrayTypeToNativeType( ReadHelper.readResponse.Results[0].Value );
                        for( var v=2; v<=4; v++ )
                        {
                            AssertEqual( valueAsArray[v], newValueAsArray[ (v-2) ], "Expected to receive the same array element." );
                        }//for v...
                    }
                    else
                    {
                        var bsAsStr = valueAsArray.utf8ToString();
                        print( "bsAsStr = " + bsAsStr );
                        var readArrAsStr = ReadHelper.readResponse.Results[0].Value.toByteString().utf8ToString();
                        print( "readArrAsStr = " + readArrAsStr );
                        AssertEqual( 2, bsAsStr.indexOf( readArrAsStr ), "Expected to receive a subset of the string starting at position 4; Original='" + bsAsStr + "' vs Now='" + readArrAsStr + "'" );
                    }
                }
                else
                {
                    // should have only received three values
                    readArray = GetArrayTypeToNativeType( ReadHelper.readResponse.Results[0].Value );
                    AssertEqual( 3, readArray.length, "Number of requested array elements was not equal to the number of returned elements" );

                    // get the 3 values into variables
                    var varOfArray1 = UaVariantToSimpleType ( valueAsArray[2] );
                    var varOfArray2 = UaVariantToSimpleType ( valueAsArray[3] );
                    var varOfArray3 = UaVariantToSimpleType ( valueAsArray[4] );
                    var indexedRead1 = UaVariantToSimpleType( readArray[0] );
                    var indexedRead2= UaVariantToSimpleType ( readArray[1] );
                    var indexedRead3 = UaVariantToSimpleType( readArray[2] );
                    print( "\tSame? " + AssertEqual( varOfArray1, indexedRead1, "The requested array element was not returned" ) + "; Original[2]='" + varOfArray1 + "' vs Now[0]='" + indexedRead1 + "'" );
                    print( "\tSame? " + AssertEqual( varOfArray2, indexedRead2, "The requested array element was not returned" ) + "; Original[3]='" + varOfArray2 + "' vs Now[1]='" + indexedRead2 + "'" );
                    print( "\tSame? " + AssertEqual( varOfArray3, indexedRead3, "The requested array element was not returned" ) + "; Original[4]='" + varOfArray3 + "' vs Now[2]='" + indexedRead3 + "'" );
                }
            }// if Read
        }// assertGreaterThan
    }//if Read
}

function read81027()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic() );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Arrays" );
        return;
    }
    for( var i=0; i<items.length; i++ )
    {
        readArray581027( items[i].NodeSetting, NodeIdSettings.guessType( items[i].NodeSetting ) );
    }
}

safelyInvoke( read81027 );