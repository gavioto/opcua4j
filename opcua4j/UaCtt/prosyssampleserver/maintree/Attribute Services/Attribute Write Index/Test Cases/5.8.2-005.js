/*  Test 5.8.2 Test 5; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to a specific element within an array, for each supported data-type.

    Revision History
        24-Sep-2009 NP: Initial version.
        11-Nov-2009 NP: REVIEWED/INCONCLUSIVE.
        24-Nov-2009 DP: Prepopulate the test nodes' array values.
                        Validate the entire array after writing to the test element.
        02-Dec-2009 DP: Changed Byte write to use a ByteString.
                        Write a non-null GUID.
        24-Mar-2010 NP: Revised to use new script library objects.
                        Revised to meet new test-case requirements.
        24-Feb-2011 NP: If initial Write fails then the item is removed from the final WRITE. (Credit: MI)

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.

     HOW THIS SCRIPT WORKS:
         1. Construct a single WRITE request containing all nodes to write.
         2. Perform the write, and check the results.
*/

function write582005()
{
    const WRITEELEMENTNUMBER = "1";
    const MIN_ARRAY_UBOUND = 2;

    // overwrite our current *global* items
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0, Attribute.Value, WRITEELEMENTNUMBER );
    var finalItems = [];

    var expectedResults = [];
    var startingArrays = []; // the values that will prepopulate each array
    var newArrayValue;
    for( var i=0; i<items.length; i++ )
    {
        var arrayWriteValues;
        switch( NodeIdSettings.guessType( items[i].NodeSetting ) )
        {
            case BuiltInType.Boolean:
                addLog( "[" + i + "] Will write to an array of Booleans" );
                arrayWriteValues = new UaBooleans();
                arrayWriteValues[0] = true;
                items[i].Value.Value.setBooleanArray( arrayWriteValues );
                break;

            case BuiltInType.Byte:
                addLog( "[" + i + "] Will write to an array of Bytes" );
                arrayWriteValues = new UaBytes();
                arrayWriteValues[0] = 5;
                items[i].Value.Value.setByteArray( arrayWriteValues );
                break;

            case BuiltInType.ByteString:
                addLog( "[" + i + "] Will write to an array of ByteStrings" );
                arrayWriteValues = new UaByteStrings();
                arrayWriteValues[0] = UaByteString.fromHexData( "0x5A6170" );
                items[i].Value.Value.setByteStringArray( arrayWriteValues );
                break;

            case BuiltInType.DateTime:
                addLog( "[" + i + "] Will write to an array of DateTimes" );
                arrayWriteValues = new UaDateTimes();
                arrayWriteValues[0] = UaDateTime.utcNow();
                items[i].Value.Value.setDateTimeArray( arrayWriteValues );
                break;

            case BuiltInType.Double:
                addLog( "[" + i + "] Will write to an array of Doubles" );
                arrayWriteValues = new UaDoubles();
                arrayWriteValues[0] = 500.1;
                items[i].Value.Value.setDoubleArray( arrayWriteValues );
                break;

            case BuiltInType.Float:
                addLog( "[" + i + "] Will write to an array of Floats" );
                arrayWriteValues = new UaFloats();
                arrayWriteValues[0] = 1.1;
                items[i].Value.Value.setFloatArray( arrayWriteValues );
                break;

            case BuiltInType.Guid:
                addLog( "[" + i + "] Will write to an array of Guids" );
                arrayWriteValues = new UaGuids();
                arrayWriteValues[0] = new UaGuid( "{24BC8E6E-56E5-4783-AA30-FFB3B2454F90}" );
                items[i].Value.Value.setGuidArray( arrayWriteValues );
                break;

            case BuiltInType.Int16:
                addLog( "[" + i + "] Will write to an array of Int16s" );
                arrayWriteValues = new UaInt16s();
                arrayWriteValues[0] = 5555;
                items[i].Value.Value.setInt16Array( arrayWriteValues );
                break;

            case BuiltInType.Int32:
                addLog( "[" + i + "] Will write to an array of Int32s" );
                arrayWriteValues = new UaInt32s();
                arrayWriteValues[0] = 555555;
                items[i].Value.Value.setInt32Array( arrayWriteValues );
                break;

            case BuiltInType.Int64:
                addLog( "[" + i + "] Will write to an array of Int64s" );
                arrayWriteValues = new UaInt64s();
                arrayWriteValues[0] = 555555555;
                items[i].Value.Value.setInt64Array( arrayWriteValues );
                break;

            case BuiltInType.String:
                addLog( "[" + i + "] Will write to an array of Strings" );
                arrayWriteValues = new UaStrings();
                arrayWriteValues[0] = "Hello World, CTT 5.8.2-006.js";
                items[i].Value.Value.setStringArray( arrayWriteValues );
                break;

            case BuiltInType.SByte:
                addLog( "[" + i + "] Will write to an array of SBytes" );
                arrayWriteValues = new UaSBytes();
                arrayWriteValues[0] = 100;
                items[i].Value.Value.setSByteArray( arrayWriteValues );
                break;

            case BuiltInType.UInt16:
                addLog( "[" + i + "] Will write to an array of UInt16s" );
                arrayWriteValues = new UaUInt16s();
                arrayWriteValues[0] = 55555;
                items[i].Value.Value.setUInt16Array( arrayWriteValues );
                break;

            case BuiltInType.UInt32:
                addLog( "[" + i + "] Will write to an array of UInt32s" );
                arrayWriteValues = new UaUInt32s();
                arrayWriteValues[0] = 55555;
                items[i].Value.Value.setUInt32Array( arrayWriteValues );
                break;

            case BuiltInType.UInt64:
                addLog( "[" + i + "] Will write to an array of UInt64s" );
                arrayWriteValues = new UaUInt64s();
                arrayWriteValues[0] = 55555;
                items[i].Value.Value.setUInt64Array( arrayWriteValues );
                break;

            case BuiltInType.XmlElement:
                addLog( "[" + i + "] Will write to an array of XmlElements" );
                arrayWriteValues = new UaXmlElements();
                arrayWriteValues[0] = new UaXmlElement();
                arrayWriteValues[0].setString( "<HelloWorld>CTT 5.8.2-006.js</HelloWorld>" );
                items[i].Value.Value.setXmlElementArray( arrayWriteValues );
                break; 

            default:
                break;
        }//switch
    
        // pre-populate array to test writing at a specific index
        newArrayValue = generateArrayWriteValue( 0, MIN_ARRAY_UBOUND, NodeIdSettings.guessType( items[i].NodeSetting ) );
        var writeResult = writeValueToValue( g_session, items[i].NodeId, newArrayValue );

        // check the writeResult, if we get an Error then SKIP this item in
        // the upcoming write.
        print( "*** Write Result [iteration " + i + " of " + items.length + "] = " + writeResult.Results[0] );
        if( writeResult.Results[0].isBad() )
        {
            addSkipped( "Skipping item '" + items[i].NodeSetting + "' because the server returned: " + writeResult.Results[0].toString() );
        }
        else
        {
            // acceptable results for the write request
            var expectedResult = new ExpectedAndAcceptedResults( StatusCode.Good );
            expectedResult.addExpectedResult( StatusCode.BadWriteNotSupported );
            expectedResults.push( expectedResult );
            // record the value written for comparing against later.
            startingArrays.push( newArrayValue );
            // add this item to the final write
            finalItems.push( items[i] );
        }

    }//for

    // do we have any items to write to?
    if( finalItems.length === 0 )
    {
        addSkipped( "Not enough items to test with. Current length = " + finalItems.length );
        return;
    }

    //WRITE the nodes.
    if( WRITE.Execute( finalItems, expectedResults, true, OPTIONAL_CONFORMANCEUNIT ) )
    {
        checkArraysAfterElementsWritten( g_session, WRITE.writeRequest, WRITE.writeResponse, startingArrays );
    }

    // revert all nodes back to original values
    revertToOriginalValues();
}

safelyInvoke( write582005 );