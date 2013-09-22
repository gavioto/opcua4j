/*  Test 5.8.2 Error Test 13; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to Invalid by means of invalid syntax of IndexRange "2:2" of a Node.
        Do this for each core data-type.

    Revision History
        29-Sep-2009 NP: Initial version.
        11-Nov-2009 NP: REVIEWED.
        02-Dec-2009 DP: Prepopulate the test nodes' array values.
                        Validate the entire array after writing to the test elements.
                        Changed Byte write to use a ByteString.
        24-Mar-2010 NP: Revised to use new script library objects.
                        Revised to meet new test-case requirements.
        30-Mar-2010 NP: Does not invoke Write verification since the write is expected to fail.
        13-May-2010 DP: Warn and stop test execution when no static array nodes are defined.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582Err013()
{
    const INDEXRANGETOWRITE = "2:2";
    const MIN_ARRAY_UBOUND = 2;

    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0, Attribute.Value, INDEXRANGETOWRITE, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined );
    if( items === null || items.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }

    //stores the number of the node we're currently working on.
    var expectedResults = [];
    var startingArrays = []; // the values that will prepopulate each array

    //dynamically construct IDs of nodes to write, specifically their values.
    for( var i=0; i<items.length; i++ )
    {
        expectedResults[i] = new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeInvalid );
        expectedResults[i].addExpectedResult( StatusCode.BadWriteNotSupported );

        items[i].Value.Value = new UaVariant();
        items[i].IndexRange = INDEXRANGETOWRITE;

        // this variable will contain the SPECIFIC UA Array object that will 
        // then be passed to the WRITE call.
        var arrayWriteValues;
        switch( NodeIdSettings.guessType( items[i].NodeSetting ) )
        {
            case BuiltInType.Boolean:
                arrayWriteValues = new UaBooleans();
                arrayWriteValues[0] = true;
                items[i].Value.Value.setBooleanArray( arrayWriteValues );
                break;

            case BuiltInType.Byte:
                arrayWriteValues = new UaBytes();
                arrayWriteValues[0] = 5;
                items[i].Value.Value.setByteArray( arrayWriteValues );
                break;

            case BuiltInType.ByteString:
                arrayWriteValues = new UaByteStrings();
                arrayWriteValues[0] = "0x435454";
                items[i].Value.Value.setByteStringArray( arrayWriteValues );
                break;

            case BuiltInType.DateTime:
                arrayWriteValues = new UaDateTimes();
                arrayWriteValues[0] = UaDateTime.utcNow();
                items[i].Value.Value.setDateTimeArray( arrayWriteValues );
                break;

            case BuiltInType.Double:
                arrayWriteValues = new UaDoubles();
                arrayWriteValues[0] = 500;
                items[i].Value.Value.setDoubleArray( arrayWriteValues );
                break;

            case BuiltInType.Float:
                arrayWriteValues = new UaFloats();
                arrayWriteValues[0] = 1.1;
                items[i].Value.Value.setFloatArray( arrayWriteValues );
                break;

            case BuiltInType.Guid:
                arrayWriteValues = new UaGuids();
                arrayWriteValues[0] = new UaGuid();
                items[i].Value.Value.setGuidArray( arrayWriteValues );
                break;

            case BuiltInType.Int16:
                arrayWriteValues = new UaInt16s();
                arrayWriteValues[0] = 5555;
                items[i].Value.Value.setInt16Array( arrayWriteValues );
                break;

            case BuiltInType.Int32:
                arrayWriteValues = new UaInt32s();
                arrayWriteValues[0] = 555555;
                items[i].Value.Value.setInt32Array( arrayWriteValues );
                break;

            case BuiltInType.Int64:
                arrayWriteValues = new UaInt64s();
                arrayWriteValues[0] = 555555555;
                items[i].Value.Value.setInt64Array( arrayWriteValues );
                break;

            case BuiltInType.String:
                arrayWriteValues = new UaStrings();
                arrayWriteValues[0] = "Hello World, CTT was here!.js";
                items[i].Value.Value.setStringArray( arrayWriteValues );
                break;

            case BuiltInType.SByte:
                arrayWriteValues = new UaSBytes();
                arrayWriteValues[0] = 100;
                items[i].Value.Value.setSByteArray( arrayWriteValues );
                break;

            case BuiltInType.UInt16:
                arrayWriteValues = new UaUInt16s();
                arrayWriteValues[0] = 55555;
                items[i].Value.Value.setUInt16Array( arrayWriteValues );
                break;

            case BuiltInType.UInt32:
                arrayWriteValues = new UaUInt32s();
                arrayWriteValues[0] = 55555;
                items[i].Value.Value.setUInt32Array( arrayWriteValues );
                break;

            case BuiltInType.UInt64:
                arrayWriteValues = new UaUInt64s();
                arrayWriteValues[0] = 55555;
                items[i].Value.Value.setUInt64Array( arrayWriteValues );
                break;

            case BuiltInType.XmlElement:
                addLog( "[" + i + "] Will write to an array of XmlElements" );
                arrayWriteValues = new UaXmlElements();
                arrayWriteValues[0] = new UaXmlElement();
                arrayWriteValues[0].setString( "<HelloWorld>123</HelloWorld>" );
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
    WRITE.Execute( items, expectedResults, true, OPTIONAL_CONFORMANCEUNIT, WRITEVERIFICATION_OFF );

    // revert all nodes back to original values
    revertToOriginalValues();
}

safelyInvoke( write582Err013 );