/*  Test 5.8.1 Test 26; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read a single attribute from a valid node where the type is 
        an array data type, but specify an indexRange that will retrieve the
        2nd element only.

    Revision History
        21-Sep-2009 NP: Initial version.
        11-Nov-2009 NP: Revised to use new Script library functions.
        11-Nov-2009 NP: REVIEWED (partial). UA Server does not support IndexRange, portions of script unverified as a result.
        30-Nov-2009 NP: Moved ByteString logic into another function for simplicity.
        01-Dec-2009 DP: Prepopulate the entire array (instead of a specific range). 
        19-Mar-2010 NP: Removed pre-population as was causing problems with Writes.
                        Separated tests of Byte[] and ByteString[] from other tests.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.

     HOW THIS SCRIPT WORKS:
         1. Read the raw array value.
         2. Read the array value specifying the IndexRange.
         3. Compare the value of the 2nd read matches element #2 of the first read.
         4. REPEAT FOR EACH DATA TYPE.
*/

/*globals AssertEqual, AssertGreaterThan, AssertUaValueOfType, Attribute, BuiltInType,
  g_session, GetArrayTypeToNativeType, MonitoredItem, print, Read, readSetting, 
  safelyInvoke, TimestampsToReturn
*/

function readArrayByteStringArray( nodeSetting )
{
    // create the node that we're going to test, and then set its initial value
    var item = MonitoredItem.fromSetting( nodeSetting, 0, Attribute.Value );
    if( item === null )
    {
        return;
    }

    // now read back the array
    print( "\tRead the whole array." );
    if( ReadHelper.Execute( item, TimestampsToReturn.Both, 100 ) )
    {
        var initialReading = item.Value;
        // check the length > 1
        if( AssertGreaterThan( 1, item.Value.length, "Array too short. Need > 1 element to test with." ) )
        {
            print("\tRead just the IndexRange of interest." );
            item.IndexRange = "1";
            if( ReadHelper.Execute( item, TimestampsToReturn.Both, 100 ) )
            {
                // should have only received one value
                var initialValueAsByteString = initialReading.Value.toByteStringArray();
                var valueAsByteString = item.Value.Value.toByteStringArray();
                AssertEqual( 1, valueAsByteString.length, "Number of requested array elements was not equal to the number of returned elements" );

                // we want to compare the single value we just read, with the values received in the array read earlier
                AssertEqual( initialValueAsByteString[1], valueAsByteString[0], "Value mismatch! The requested array element was not returned." );
            }
        }
    }
}

function readArray581026( item, nodeType )
{
    const MAXSTRINGSIZE = 100;
    
    if( item === BuiltInType.ByteString )
    {
        readArrayByteStringArray( item.NodeSetting );
        return;
    }

    item.AttributeId = Attribute.Value;
    item.IndexRange = "";
   

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    STEP 1) INITIAL READING OF WHOLE ARRAY.
*/
    var maxAge = readSetting( "/Server Test/Time Tolerence" ).toString();
    if( ReadHelper.Execute( item, TimestampsToReturn.Both, maxAge ) )
    {
        // display the values
        var resultsString = ReadHelper.readResponse.Results[0].Value.toString();
        if( resultsString.length > MAXSTRINGSIZE )
        {
            resultsString = resultsString.substring( 0, MAXSTRINGSIZE ) + "... (truncated by script)";
        }
        print( "\tArray value: '" + resultsString + "'" );

        // make sure ArrayType = True
        if( !AssertEqual( 1, ReadHelper.readResponse.Results[0].Value.ArrayType, "Expected an Array type." ) )
        {
            return;
        }
        // make sure DataType matches expectation
        if( !AssertUaValueOfType( nodeType, ReadHelper.readResponse.Results[0].Value ) )
        {
            return;
        }
        if( AssertGreaterThan( 1, ReadHelper.readResponse.Results[0].Value.getArraySize(), "Array too short: at least four elements are required. Size: " + ReadHelper.readResponse.Results[0].Value.getArraySize() ) )
        {
            // store the read value to compare against later...
            var initialReading = GetArrayTypeToNativeType( ReadHelper.readResponse.Results[0].Value );


    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        STEP 2) READING ARRAY SPECIFYING AN INDEX RANGE TO RETREIVE THE
                2ND ELEMENT OF THE ARRAY ONLY. */

            item.IndexRange = "1";
            if( ReadHelper.Execute( item, TimestampsToReturn.Both, 100 ) )
            {
                // should have only received one value
                AssertEqual( 1, ReadHelper.readResponse.Results[0].Value.getArraySize(), "Number of requested array elements was not equal to the number of returned elements" );

                // we want to compare the single value we just read, with the values received in the array read earlier
                var singleElementReading = GetArrayTypeToNativeType( ReadHelper.readResponse.Results[0].Value );
                AssertEqual( initialReading[1], singleElementReading[0], "Value mismatch! The requested array element was not returned." );
            }// if Read
        }
    }
}

function read581026()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0 );
    if( items === null || items.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }
    for( var i=0; i<items.length; i++ )
    {
        readArray581026( items[i], NodeIdSettings.guessType( items[i].NodeSetting ) );
    }
}

safelyInvoke( read581026 );