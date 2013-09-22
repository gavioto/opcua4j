/*  Test 5.8.2 Test 6; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to the first and second elements (IndexRage="1:2") of a Node.
        Do this for each core data-type.

    Revision History
        25-Sep-2009 Dev: Initial version.
        11-Nov-2009 NP: REVIEWED/INCONCLUSIVE.
        24-Nov-2009 DP: Prepopulate the test nodes' array values.
                        Validate the entire array after writing to the test elements.
        25-Nov-2009 NP: Fixed error in script caused by ByteString, in Array checking verification.
        27-Nov-2009 DP: Fixed prepopulated array to a min size that's one element larger than the writing range.
        02-Dec-2009 DP: Write non-null GUIDs.
                        Fixed some writes to use values that are within the range of the datatype.
        24-Mar-2010 NP: Revised to use new script library objects.
                        Revised to meet new test-case requirements.
        13-May-2010 DP: Warn and stop test execution when no static array nodes are defined.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582006()
{
    const INDEXRANGETOWRITE = "1:2";
    const MIN_ARRAY_UBOUND = 3;

    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0, Attribute.Value, INDEXRANGETOWRITE, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined );
    if( items === null || items.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }
    var expectedResults = [];

    var startingArrays = [];
    for( var i=0; i<items.length; i++ )
    {
        expectedResults[i] = new ExpectedAndAcceptedResults( StatusCode.Good );
        expectedResults[i].addExpectedResult( StatusCode.BadWriteNotSupported );

        // this variable will contain the SPECIFIC UA Array object that will 
        // then be passed to the WRITE call.
        var arrayWriteValues;
        switch( NodeIdSettings.guessType( items[i].NodeSetting ) )
        {
            case  BuiltInType.Boolean:
                arrayWriteValues = new UaBooleans();
                arrayWriteValues[0] = true;
                arrayWriteValues[1] = false;
                items[i].Value.Value.setBooleanArray( arrayWriteValues );
                break;

            case BuiltInType.Byte:
                arrayWriteValues = new UaBytes();
                arrayWriteValues[0] = 5;
                arrayWriteValues[1] = 6;
                items[i].Value.Value.setByteArray( arrayWriteValues );
                break;

            case BuiltInType.ByteString:
                arrayWriteValues = new UaByteStrings();
                arrayWriteValues[0] = UaByteString.fromHexData( "0x11223344" );
                arrayWriteValues[1] = UaByteString.fromHexData( "0xAABBCCDD" );
                items[i].Value.Value.setByteStringArray( arrayWriteValues );
                break;

            case BuiltInType.DateTime:
                arrayWriteValues = new UaDateTimes();
                arrayWriteValues[0] = UaDateTime.utcNow();
                arrayWriteValues[1] = arrayWriteValues[0].addHours(1);
                items[i].Value.Value.setDateTimeArray( arrayWriteValues );
                break;

            case BuiltInType.Double:
                arrayWriteValues = new UaDoubles();
                arrayWriteValues[0] = 500;
                arrayWriteValues[1] = 900;
                items[i].Value.Value.setDoubleArray( arrayWriteValues );
                break;

            case BuiltInType.Float:
                arrayWriteValues = new UaFloats();
                arrayWriteValues[0] = 1.1;
                arrayWriteValues[1] = 2.2;
                items[i].Value.Value.setFloatArray( arrayWriteValues );
                break;

            case BuiltInType.Guid:
                arrayWriteValues = new UaGuids();
                arrayWriteValues[0] = new UaGuid( "{7CC264CB-0454-4391-B904-EA0066BBE254}" );
                arrayWriteValues[1] = new UaGuid( "{255DFC14-C871-4270-A90E-E675B18B56B5}" );
                items[i].Value.Value.setGuidArray( arrayWriteValues );
                break;

            case BuiltInType.Int16:
                arrayWriteValues = new UaInt16s();
                arrayWriteValues[0] = 5555;
                arrayWriteValues[1] = 6666;
                items[i].Value.Value.setInt16Array( arrayWriteValues );
                break;

            case BuiltInType.Int32:
                arrayWriteValues = new UaInt32s();
                arrayWriteValues[0] = 555555;
                arrayWriteValues[1] = 666666;
                items[i].Value.Value.setInt32Array( arrayWriteValues );
                break;

            case BuiltInType.Int64:
                arrayWriteValues = new UaInt64s();
                arrayWriteValues[0] = 555555555;
                arrayWriteValues[1] = 666666666;
                items[i].Value.Value.setInt64Array( arrayWriteValues );
                break;

            case BuiltInType.String:
                arrayWriteValues = new UaStrings();
                arrayWriteValues[0] = "Hello World #0, CTT 5.8.2-006.js";
                arrayWriteValues[1] = "Hello World #1, CTT 5.8.2-006.js";
                items[i].Value.Value.setStringArray( arrayWriteValues );
                break;

            case BuiltInType.SByte:
                arrayWriteValues = new UaSBytes();
                arrayWriteValues[0] = 100;
                arrayWriteValues[1] = 50;
                items[i].Value.Value.setSByteArray( arrayWriteValues );
                break;

            case BuiltInType.UInt16:
                arrayWriteValues = new UaUInt16s();
                arrayWriteValues[0] = 55555;
                arrayWriteValues[1] = 44444;
                items[i].Value.Value.setUInt16Array( arrayWriteValues );
                break;

            case BuiltInType.UInt32:
                arrayWriteValues = new UaUInt32s();
                arrayWriteValues[0] = 55555;
                arrayWriteValues[1] = 66666;
                items[i].Value.Value.setUInt32Array( arrayWriteValues );
                break;

            case BuiltInType.UInt64:
                arrayWriteValues = new UaUInt64s();
                arrayWriteValues[0] = 55555;
                arrayWriteValues[1] = 66666;
                items[i].Value.Value.setUInt64Array( arrayWriteValues );
                break;

            case BuiltInType.XmlElement:
                arrayWriteValues = new UaXmlElements();
                arrayWriteValues[0] = new UaXmlElement();
                arrayWriteValues[0].setString( "<HelloWorld0>CTT 5.8.2-006.js</HelloWorld0>" );
                arrayWriteValues[1] = new UaXmlElement();
                arrayWriteValues[1].setString( "<HelloWorld1>CTT 5.8.2-006.js</HelloWorld1>" );
                items[i].Value.Value.setXmlElementArray( arrayWriteValues );
                break; 

            default:
                break;
        }//switch
    
        // pre-populate array to test writing at a specific index range
        startingArrays[i] = generateArrayWriteValue( 0, MIN_ARRAY_UBOUND, NodeIdSettings.guessType( items[i].NodeSetting ) );
        writeValueToValue( g_session, items[i].NodeId, startingArrays[i] );
    }//for

    //WRITE the nodes.
    if( WRITE.Execute( items, expectedResults, true, OPTIONAL_CONFORMANCEUNIT ) )
    {
        // validate entire array
        checkArraysAfterElementsWritten( g_session, WRITE.writeRequest, WRITE.writeResponse, startingArrays );
    }

    // revert all nodes back to original values
    revertToOriginalValues();
}

safelyInvoke( write582006 );