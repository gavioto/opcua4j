/*  Test 5.8.2 Test 7; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to the first 3 elements (IndexRage="0:2") of a Node.
        Do this for each core data-type.

    Revision History
        02-Oct-2009 Dev: Initial version.
        11-Nov-2009 NP : REVIEWED/INCONCLUSIVE.
        24-Nov-2009 DP: Prepopulate the test nodes' array values.
                        Validate the entire array after writing to the test elements.
        02-Dec-2009 DP: Changed Byte write to use a ByteString.
                        Write non-null GUIDs.
                        Fixed some writes to use values that are within the range of the datatype.
        24-Mar-2010 NP: Revised to use new script library objects.
                        Revised to meet new test-case requirements.
        13-May-2010 DP: Warn and stop test execution when no static array nodes are defined.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582007()
{
    const INDEXRANGETOWRITE = "0:2";
    const MIN_ARRAY_UBOUND = 5;

    var dataTypeNodeNames = NodeIdSettings.ArraysStatic();
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0, Attribute.Value, INDEXRANGETOWRITE, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined );
    if( items === null || items.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }
    var expectedResults = [];

    var startingArrays = []; // the values that will prepopulate each array
    
    //dynamically construct IDs of nodes to write, specifically their values.
    for( var i=0; i<items.length; i++ )
    {
        expectedResults[i] = new ExpectedAndAcceptedResults( StatusCode.Good );
        expectedResults[i].addExpectedResult( StatusCode.BadWriteNotSupported );

        // this variable will contain the SPECIFIC UA Array object that will 
        // then be passed to the WRITE call.
        var arrayWriteValues;
        var nodeType;

        switch( NodeIdSettings.guessType( items[i].NodeSetting ) )
        {
            case BuiltInType.Boolean: 
                arrayWriteValues = new UaBooleans();
                arrayWriteValues[0] = true;
                arrayWriteValues[1] = false;
                arrayWriteValues[2] = true;
                items[i].Value.Value.setBooleanArray( arrayWriteValues );
                break;

            case BuiltInType.Byte: 
                arrayWriteValues = new UaBytes();
                arrayWriteValues[0] = 5;
                arrayWriteValues[1] = 6;
                arrayWriteValues[2] = 7;
                items[i].Value.Value.setByteArray( arrayWriteValues );
                break;

            case BuiltInType.ByteString:
                arrayWriteValues = new UaByteStrings();
                arrayWriteValues[0] = UaByteString.fromHexData( "0x436F6D706C69616E6365" );
                arrayWriteValues[1] = UaByteString.fromHexData( "0x54657374" );
                arrayWriteValues[2] = UaByteString.fromHexData( "0x546F6F6C" );
                items[i].Value.Value.setByteStringArray( arrayWriteValues );
                break;

            case BuiltInType.DateTime: 
                arrayWriteValues = new UaDateTimes();
                arrayWriteValues[0] = UaDateTime.utcNow();
                arrayWriteValues[1] = arrayWriteValues[0].addHours(1);
                arrayWriteValues[2] = arrayWriteValues[0].addHours(2);
                items[i].Value.Value.setDateTimeArray( arrayWriteValues );
                break;

            case BuiltInType.Double:
                arrayWriteValues = new UaDoubles();
                arrayWriteValues[0] = 500;
                arrayWriteValues[1] = 900;
                arrayWriteValues[2] = 1800;
                items[i].Value.Value.setDoubleArray( arrayWriteValues );
                break;

            case BuiltInType.Float:
                arrayWriteValues = new UaFloats();
                arrayWriteValues[0] = 1.1;
                arrayWriteValues[1] = 2.2;
                arrayWriteValues[2] = 3.3;
                items[i].Value.Value.setFloatArray( arrayWriteValues );
                break;

            case BuiltInType.Guid:
                arrayWriteValues = new UaGuids();
                arrayWriteValues[0] = new UaGuid( "{27CA74D7-320E-404E-A987-C78AB0BCC555}" );
                arrayWriteValues[1] = new UaGuid( "{2DE544F1-F463-4D38-81F6-2DA7191E16E3}" );
                arrayWriteValues[2] = new UaGuid( "{CDB4AC4D-AA56-417D-A045-C79894BCA4E0}" );
                items[i].Value.Value.setGuidArray( arrayWriteValues );
                break;

            case BuiltInType.Int16:
                arrayWriteValues = new UaInt16s();
                arrayWriteValues[0] = 5555;
                arrayWriteValues[1] = 6666;
                arrayWriteValues[2] = 7777;
                items[i].Value.Value.setInt16Array( arrayWriteValues );
                break;

            case BuiltInType.Int32:
                arrayWriteValues = new UaInt32s();
                arrayWriteValues[0] = 555555;
                arrayWriteValues[1] = 666666;
                arrayWriteValues[2] = 777777;
                items[i].Value.Value.setInt32Array( arrayWriteValues );
                break;

            case BuiltInType.Int64: 
                arrayWriteValues = new UaInt64s();
                arrayWriteValues[0] = 555555555;
                arrayWriteValues[1] = 666666666;
                arrayWriteValues[2] = 777777777;
                items[i].Value.Value.setInt64Array( arrayWriteValues );
                break;

            case BuiltInType.String:
                arrayWriteValues = new UaStrings();
                arrayWriteValues[0] = "Hello World #1, CTT 5.8.2-006.js";
                arrayWriteValues[1] = "Hello World #2, CTT 5.8.2-006.js";
                arrayWriteValues[2] = "Hello World #3, CTT 5.8.2-006.js";
                items[i].Value.Value.setStringArray( arrayWriteValues );
                break;

            case BuiltInType.SByte:
                arrayWriteValues = new UaSBytes();
                arrayWriteValues[0] = 100;
                arrayWriteValues[1] = 50;
                arrayWriteValues[2] = 80;
                items[i].Value.Value.setSByteArray( arrayWriteValues );
                break;

            case BuiltInType.UInt16:
                arrayWriteValues = new UaUInt16s();
                arrayWriteValues[0] = 55555;
                arrayWriteValues[1] = 44444;
                arrayWriteValues[2] = 45454;
                items[i].Value.Value.setUInt16Array( arrayWriteValues );
                break;

            case BuiltInType.UInt32: 
                arrayWriteValues = new UaUInt32s();
                arrayWriteValues[0] = 55555;
                arrayWriteValues[1] = 66666;
                arrayWriteValues[2] = 77777;
                items[i].Value.Value.setUInt32Array( arrayWriteValues );
                break;

            case BuiltInType.UInt64:
                arrayWriteValues = new UaUInt64s();
                arrayWriteValues[0] = 55555;
                arrayWriteValues[1] = 66666;
                arrayWriteValues[2] = 77777;
                items[i].Value.Value.setUInt64Array( arrayWriteValues );
                break;

            case BuiltInType.XmlElement:
                arrayWriteValues = new UaXmlElements();
                arrayWriteValues[0] = new UaXmlElement();
                arrayWriteValues[0].setString( "<HelloWorld1>CTT 5.8.2-006.js</HelloWorld1>" );
                arrayWriteValues[1] = new UaXmlElement();
                arrayWriteValues[1].setString( "<HelloWorld2>CTT 5.8.2-006.js</HelloWorld2>" );
                arrayWriteValues[2] = new UaXmlElement();
                arrayWriteValues[2].setString( "<HelloWorld3>CTT 5.8.2-006.js</HelloWorld3>" );
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

safelyInvoke( write582007 );