/*  Test 5.8.2 Test 8; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to an Array Node while specify an indexRange that will
        write to the last 3 elements of the array ONLY.

    Revision History
        25-Sep-2009 NP: Initial version.
        11-Nov-2009 NP: REVIEWED/INCONCLUSIVE.
        24-Nov-2009 DP: Prepopulate the test nodes' array values.
                        Validate the entire array after writing to the test elements.
        02-Dec-2009 DP: Changed Byte write to use a ByteString.
                        Fixed some writes to use values that are within the range of the datatype.
        24-Mar-2010 NP: Revised to use new script library objects.
                        Revised to meet new test-case requirements.
        13-May-2010 DP: Warn and stop test execution when no static array nodes are defined.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.

     HOW THIS SCRIPT WORKS:
         1. Read the raw array value.
         2. Write new array value specifying the IndexRange 'last 3 items'.

     Writing XmlElements does not work as intended; CTT issue?
*/

function writeArray582008( item )
{
    const MAXSTRINGSIZE = 100;
    const MIN_ARRAY_UBOUND = 4;

    print( "\n\nReading: '" + item.NodeId + "' (<b>setting</b>: '<i>" + item.NodeSetting + "</i>') " );

    var nodeType = NodeIdSettings.guessType( item.NodeSetting );
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    STEP 0) POPULATE ARRAYS.
      No need to validate; the read will check that arrays are as required.
*/
    var startingArray; // the values that will prepopulate the array
    startingArray = generateArrayWriteValue( 0, MIN_ARRAY_UBOUND, nodeType );
    writeValueToValue( g_session, item.NodeId, startingArray );

    var expectedResults = [];
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    STEP 1) INITIAL READING OF WHOLE ARRAY.
*/
    if( READ.Execute( item ) )
    {
        // display the values
        var resultsString = READ.readResponse.Results[0].Value.toString();
        if( resultsString.length > MAXSTRINGSIZE )
        {
            resultsString = resultsString.substring( 0, MAXSTRINGSIZE ) + "... (truncated by script)";
        }
        addLog( "Array value: '" + resultsString + "'" );
        
        // check the data type
        var valueAsArray = GetArrayTypeToNativeType( READ.readResponse.Results[0].Value );
        

        // quickly check to make sure the array we've just read is at least 2
        // elements in size...
        var moveOntoWrite = false;
        try
        {
            if( valueAsArray === null )
            {
                addError( "Array is null: " + nodeName );
            }
            else if( valueAsArray.length >= 4 )
            {
                moveOntoWrite = true;
            }
            else if( valueAsArray.length < 4 )
            {
                addError( "Array is too short: at least 4 elements are required. Size: " + valueAsArray.length + "\nSkipping this node: " + nodeName );
            }
            else if( valueAsArray.getArraySize() < 3 )
            {
                addError( "Array is too short: at least 3 elements are required. Size: " + valueAsArray.getArraySize() + "\nSkipping this node: " + nodeName );
            }
            else
            {
                moveOntoWrite = true;
            }
        }
        catch( exception )
        {
        }

        
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        STEP 2) WRITE ARRAY SPECIFYING AN INDEX RANGE OF THE 
                LAST 3 ITEMS. */
        
        if( moveOntoWrite )
        {
            expectedResults[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
            expectedResults[0].addExpectedResult( StatusCode.BadWriteNotSupported );

            // we now need to build the string to specify the range
            var lastIndex = valueAsArray.length - 1;
            var indexRangeString = ( lastIndex - 2 ) + ":" + lastIndex;
            item.IndexRange = indexRangeString;

            // now to specify the values to write
            var arrayWriteValues;
            switch( nodeType )
            {
                case BuiltInType.Boolean:
                    arrayWriteValues = new UaBooleans();
                    arrayWriteValues[0] = true;
                    arrayWriteValues[1] = false;
                    arrayWriteValues[2] = true;
                    item.Value.Value.setBooleanArray( arrayWriteValues );
                    break;

                case BuiltInType.Byte:
                    arrayWriteValues = new UaBytes();
                    arrayWriteValues[0] = 5;
                    arrayWriteValues[1] = 6;
                    arrayWriteValues[2] = 7;
                    item.Value.Value.setByteArray( arrayWriteValues );
                    break;

                case BuiltInType.ByteString:
                    arrayWriteValues = new UaByteStrings();
                    arrayWriteValues[0] = UaByteString.fromHexData( "0x436F6D706C69616E6365" );
                    arrayWriteValues[1] = UaByteString.fromHexData( "0x54657374" );
                    arrayWriteValues[2] = UaByteString.fromHexData( "0x546F6F6C" );
                    item.Value.Value.setByteStringArray( arrayWriteValues );
                    break;

                case BuiltInType.DateTime:
                    arrayWriteValues = new UaDateTimes();
                    arrayWriteValues[0] = UaDateTime.utcNow();
                    arrayWriteValues[1] = arrayWriteValues[0].addHours(1);
                    arrayWriteValues[2] = arrayWriteValues[1].addHours(1);
                    item.Value.Value.setDateTimeArray( arrayWriteValues );
                    break;

                case BuiltInType.Double:
                    arrayWriteValues = new UaDoubles();
                    arrayWriteValues[0] = 500;
                    arrayWriteValues[1] = 900;
                    arrayWriteValues[2] = 3.14;
                    item.Value.Value.setDoubleArray( arrayWriteValues );
                    break;

                case BuiltInType.Float:
                    arrayWriteValues = new UaFloats();
                    arrayWriteValues[0] = 1.1;
                    arrayWriteValues[1] = 2.2;
                    arrayWriteValues[2] = 3.14;
                    item.Value.Value.setFloatArray( arrayWriteValues );
                    break;

                case BuiltInType.Guid:
                    arrayWriteValues = new UaGuids();
                    arrayWriteValues[0] = new UaGuid( "{83B1CA3D-0C92-3DCC-A551-9856BAD027CE}" );
                    arrayWriteValues[1] = new UaGuid( "{D8E71CFD-AF83-3FC0-954B-DFEB79C8E7E3}" );
                    arrayWriteValues[2] = new UaGuid( "{0E617567-FAFC-32BD-BD4D-BE89B905580D}" );
                    item.Value.Value.setGuidArray( arrayWriteValues );
                    break;

                case BuiltInType.Int16:
                    arrayWriteValues = new UaInt16s();
                    arrayWriteValues[0] = 5555;
                    arrayWriteValues[1] = 6666;
                    arrayWriteValues[2] = 5656;
                    item.Value.Value.setInt16Array( arrayWriteValues );
                    break;

                case BuiltInType.Int32:
                    arrayWriteValues = new UaInt32s();
                    arrayWriteValues[0] = 555555;
                    arrayWriteValues[1] = 666666;
                    arrayWriteValues[2] = 565656;
                    item.Value.Value.setInt32Array( arrayWriteValues );
                    break;

                case BuiltInType.Int64:
                    arrayWriteValues = new UaInt64s();
                    arrayWriteValues[0] = 555555555;
                    arrayWriteValues[1] = 666666666;
                    arrayWriteValues[2] = 565656565;
                    item.Value.Value.setInt64Array( arrayWriteValues );
                    break;

                case BuiltInType.String:
                    arrayWriteValues = new UaStrings();
                    arrayWriteValues[0] = "Hello World #0, CTT 5.8.2-008.js";
                    arrayWriteValues[1] = "Hello World #1, CTT 5.8.2-008.js";
                    arrayWriteValues[2] = "Hello World #2, CTT 5.8.2-008.js";
                    item.Value.Value.setStringArray( arrayWriteValues );
                    break;

                case BuiltInType.SByte:
                    arrayWriteValues = new UaSBytes();
                    arrayWriteValues[0] = 100;
                    arrayWriteValues[1] = 50;
                    arrayWriteValues[2] = 8;
                    item.Value.Value.setSByteArray( arrayWriteValues );
                    break;

                case BuiltInType.UInt16:
                    arrayWriteValues = new UaUInt16s();
                    arrayWriteValues[0] = 55555;
                    arrayWriteValues[1] = 44444;
                    arrayWriteValues[2] = 56565;
                    item.Value.Value.setUInt16Array( arrayWriteValues );
                    break;

                case BuiltInType.UInt32:
                    arrayWriteValues = new UaUInt32s();
                    arrayWriteValues[0] = 55555;
                    arrayWriteValues[1] = 66666;
                    arrayWriteValues[2] = 56565;
                    item.Value.Value.setUInt32Array( arrayWriteValues );
                    break;

                case BuiltInType.UInt64:
                    arrayWriteValues = new UaUInt64s();
                    arrayWriteValues[0] = 55555;
                    arrayWriteValues[1] = 66666;
                    arrayWriteValues[2] = 56565;
                    item.Value.Value.setUInt64Array( arrayWriteValues );
                    break;
                case BuiltInType.XmlElement:
                    arrayWriteValues = new UaXmlElements();
                    arrayWriteValues[0] = new UaXmlElement();
                    arrayWriteValues[0].setString( "<a>5.8.2-008</a>" );
                    arrayWriteValues[1] = new UaXmlElement();
                    arrayWriteValues[1].setString( "<b>5.8.2-008</b>" );
                    arrayWriteValues[2] = new UaXmlElement();
                    arrayWriteValues[2].setString( "<c>5.8.2-008</c>" );
                    item.Value.Value.setXmlElementArray( arrayWriteValues );
                    break;
                default:
                    break;
            }//switch
            

            //WRITE the nodes.
            addLog( "Writing ARRAY node: '" + item.NodeId + "' (<b>Setting</b>: '<i>" + item.NodeSetting + "</i>')" );
            if( WRITE.Execute( item, expectedResults, true, OPTIONAL_CONFORMANCEUNIT ) )
            {
                // validate entire array
                checkArraysAfterElementsWritten( g_session, WRITE.writeRequest, WRITE.writeResponse, [ startingArray ] );
            }
        }// if moveOntoSecondRead
    }
}

function write582008()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic() );
    if( items === null || items.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }
    
    for( var i=0; i<items.length; i++ )
    {
        writeArray582008( items[i] );
    }

    // revert all nodes back to original values
    revertToOriginalValues();
}

safelyInvoke( write582008 );