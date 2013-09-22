/*  Test 5.8.1 Test 28; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read a single attribute from a valid node where the type is 
        an array data type, but specify an indexRange that will retrieve the
        last 3 elements of the array ONLY.

    Revision History
        23-Sep-2009 NP: Initial version.
        11-Nov-2009 NP: Revised to use new Script library objects.
        11-Nov-2009 NP: REVIEWED.
        16-Nov-2009 DP: Removed error throws when the nodeSetting is not set,
                        removed duplicate variable declarations,
                        removed unused const.
        01-Dec-2009 DP: Prepopulate the entire array (instead of a specific range). 
        30-Apr-2010 NP: Bugfix: Corrected bytestring vs bytestring[] and comparing values read vs cached.
        20-Dec-2010 NP: Removed extra READ which is unnecessary.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.

     HOW THIS SCRIPT WORKS:
         1. Read the raw array value.
         2. Read the array value specifying the IndexRange 'last 3 items'.
         3. Compare the value of the 2nd read matches the last 3 elements
            of the first read.
         4. REPEAT FOR EACH DATA TYPE.
*/

function readArray581028( nodeSetting, nodeType )
{
    print( "\nTESTING TYPE: " + BuiltInType.toString( nodeType ) + "\nSETTING: " + nodeSetting );
    print( "-------------------------------------------------------------------" );

    var item = MonitoredItem.fromSetting( nodeSetting, 0 );
    if( item == null )
    {
        return;
    }
    item.Value.Value = generateArrayWriteValue( 0, 3, nodeType );


    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        STEP 1) INITIAL READING OF WHOLE ARRAY.
    */
    var readArray;
    print( "Get the initial value of the array." );
    if( ReadHelper.Execute( item, TimestampsToReturn.Both ) )
    {
        // store the array value, because we'll compare against it later...
        var valueAsArray = GetArrayTypeToNativeType( ReadHelper.readResponse.Results[0].Value );

        // check the data type
        var moveOntoSecondRead = true;
        if( nodeType == BuiltInType.Byte || nodeType == BuiltInType.ByteString )
        {
            moveOntoSecondRead = AssertGreaterThan( 3, valueAsArray.length, "Array too short. Needs to be at least 4 characters long. Node '" + item.NodeId + "' on setting '" + nodeSetting + "'" );
        }
        else
        {
            AssertEqual( 1, ReadHelper.readResponse.Results[0].Value.ArrayType, "Expected an Array type." );
            moveOntoSecondRead = AssertGreaterThan( 3, ReadHelper.readResponse.Results[0].Value.getArraySize(), "Array too short. Needs to be at least 4 elements long. Node '" + item.NodeId + "' on setting '" + nodeSetting + "'" );
        }
        if( moveOntoSecondRead )
        {
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        STEP 2) READING ARRAY SPECIFYING AN INDEX RANGE TO RETREIVE THE
                2ND ELEMENT OF THE ARRAY ONLY. */
            // we now need to build the string to specify the range
            // treat byte[] and bytestring differently from other data-types
            var lastIndex;
            if( nodeType === BuiltInType.Byte || nodeType === BuiltInType.ByteString )
            {
                // treat bytestring different to bytestring[]
                if( ReadHelper.readResponse.Results[0].Value.ArrayType === 1 )
                {
                    // bytestring[]
                    lastIndex = valueAsArray.length - 1;
                }
                else
                {
                    // bytestring
                    lastIndex = valueAsArray.utf8ToString().length - 1;
                }
            }
            else
            {
                lastIndex = valueAsArray.length - 1;
            }
            var indexRangeString = ( lastIndex - 2 ) + ":" + lastIndex;
            item.IndexRange = indexRangeString;

            print( "Get the last 3 elements of the array: '" + item.IndexRange + "'." );
            if( ReadHelper.Execute( item, TimestampsToReturn.Both ) )
            {
                // depending upon the data-type, we will either do an element-by-element
                // check, or a string compare
                if( nodeType == BuiltInType.Byte || nodeType == BuiltInType.ByteString )
                {
                    // we need to treat ByteString differently to ByteString[]
                    if( ReadHelper.readResponse.Results[0].Value.ArrayType === 1 )
                    {
                        // bytestring[]
                        // check that array elements 2-4 are equal
                        var newValueAsArray = GetArrayTypeToNativeType( ReadHelper.readResponse.Results[0].Value );
                        for( var v=(lastIndex-2); v<=lastIndex; v++ )
                        {
                            var offset = v - (lastIndex-2);
                            AssertEqual( valueAsArray[v], newValueAsArray[ offset ], "Expected to receive the same array element." );
                        }//for v...
                    }
                    else
                    {
                        // bytestring
                        var bsAsStr = valueAsArray.utf8ToString();
                        var readArrAsStr = ReadHelper.readResponse.Results[0].Value.toByteString().utf8ToString();
                        print("\n\n\n\nbsAsStr = " + bsAsStr + "\nreadArrAsStr = " + readArrAsStr );
                        AssertEqual( (lastIndex-2), bsAsStr.indexOf( readArrAsStr ), "Expected to receive a subset of the string starting at position 4; Original='" + bsAsStr + "' vs Now='" + readArrAsStr + "'" );
                    }
                }
                else
                {
                    // should have only received three values
                    readArray = GetArrayTypeToNativeType( ReadHelper.readResponse.Results[0].Value );
                    AssertEqual( 3, readArray.length, "Number of requested array elements was not equal to the number of returned elements" );

                    // get the 3 values into variables
                    var varOfArray1 = UaVariantToSimpleType ( valueAsArray[lastIndex - 2] );
                    var varOfArray2 = UaVariantToSimpleType ( valueAsArray[lastIndex - 1] );
                    var varOfArray3 = UaVariantToSimpleType ( valueAsArray[lastIndex] );
                    var indexedRead1 = UaVariantToSimpleType( readArray[0] );
                    var indexedRead2= UaVariantToSimpleType ( readArray[1] );
                    var indexedRead3 = UaVariantToSimpleType( readArray[2] );
                    print( "\tSame? " + AssertEqual( varOfArray1, indexedRead1, "The requested array element was not returned" ) + "; Original[2]='" + varOfArray1 + "' vs Now[0]='" + indexedRead1 + "'" );
                    print( "\tSame? " + AssertEqual( varOfArray2, indexedRead2, "The requested array element was not returned" ) + "; Original[3]='" + varOfArray2 + "' vs Now[1]='" + indexedRead2 + "'" );
                    print( "\tSame? " + AssertEqual( varOfArray3, indexedRead3, "The requested array element was not returned" ) + "; Original[4]='" + varOfArray3 + "' vs Now[2]='" + indexedRead3 + "'" );
                }//if nodeType...
            }//if Read
        }//if moveOntoSecondRead
    }//if Read
}

function read581028()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic() );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Arrays" );
        return;
    }
    for( var i=0; i<items.length; i++ )
    {
        readArray581028( items[i].NodeSetting, NodeIdSettings.guessType( items[i].NodeSetting ) );
    }
}

safelyInvoke( read581028 );