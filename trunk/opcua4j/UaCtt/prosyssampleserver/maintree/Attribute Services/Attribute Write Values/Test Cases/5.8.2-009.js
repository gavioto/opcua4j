/*  Test 5.8.2 Test 9; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to an Array Node while specify values for each and every element.
        Do this for each core data-type.
        IndexRange = "".

    Revision History
        29-Sep-2009 NP: Initial version.
        16-Nov-2009 NP: REVIEWED.
        03-Dec-2010 NP: Array of byte is now of type Byte[] instead of ByteString.
        10-Dec-2010 MI: added missing declaration of arrayWriteValues
                        fixed value generation for Byte
                        fixed value generation for DateTime

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.

     HOW THIS SCRIPT WORKS:
         1. Read the raw array value.
         2. Write new array values.
*/

function writeArray582009( item )
{
    const MAXSTRINGSIZE = 100;

    if( item === undefined || item == null )
    {
        addError( "Item not specified. Cannot testing writing an array." );
        return;
    }

    item.DataType = NodeIdSettings.guessType( item.NodeSetting );
    addLog( "\n\nTESTING TYPE: " + BuiltInType.toString( item.DataType ) + ", on NodeId: '" + item.NodeId + "' (setting: '" + item.NodeSetting + "')" );
    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();

    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.MaxAge = 100;
    readReq.TimestampsToReturn = TimestampsToReturn.Both;
    readReq.NodesToRead[0].NodeId = item.NodeId;
    readReq.NodesToRead[0].AttributeId = Attribute.Value;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    STEP 1) INITIAL READING OF WHOLE ARRAY.
*/
    addLog( "Reading ARRAY node: '" + item.NodeId + "', of type: " + BuiltInType.toString( item.DataType ) );
    var uaStatus = g_session.read( readReq, readRes );

    // check result
    if( uaStatus.isGood() )
    {
        if( checkReadValidParameterArray( readReq, readRes ) )
        {
            // display the values
            var resultsString = readRes.Results[0].Value.toString();
            if( resultsString.length > MAXSTRINGSIZE )
            {
                resultsString = resultsString.substring( 0, MAXSTRINGSIZE ) + "... (truncated by script)";
            }
            print( "Array value: '" + resultsString + "'" );

            // check the data type
            var valueAsArray = GetArrayTypeToNativeType( readRes.Results[0].Value );
            if( valueAsArray.length === 0 )
            {
                addError( "Test cannot be completed: array length is zero; no elements to write to." );
                return;
            }



        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            STEP 2) WRITE ARRAY SPECIFYING A VALUE FOR EACH ELEMENT  */
            
            // define the write header objects
            var writeReq = new UaWriteRequest();
            var writeRes = new UaWriteResponse();
            g_session.buildRequestHeader( writeReq.RequestHeader );

            writeReq.NodesToWrite[0].NodeId = item.NodeId;
            writeReq.NodesToWrite[0].AttributeId = Attribute.Value;

            // we'll omit the indexRange, since we're writing the whole array

            // now to specify the values to write
            var w;
            var arrayWriteValues;
            switch( item.DataType )
            {
                case BuiltInType.Boolean:
                    arrayWriteValues = new UaBooleans();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = w % 2 === 0 ? true : false;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setBooleanArray( arrayWriteValues );
                    break;

                case BuiltInType.Byte:
                    arrayWriteValues = new UaBytes();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = w;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setByteArray( arrayWriteValues );
                    break;

                case BuiltInType.ByteString:
                    arrayWriteValues = new UaByteStrings();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = ( UaByteString.fromStringData( "CTT 5.8.2-009 (" + w + ")" ) );
                    }
                    writeReq.NodesToWrite[0].Value.Value.setByteStringArray( arrayWriteValues );
                    break;

                case BuiltInType.DateTime:
                    arrayWriteValues = new UaDateTimes();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        var nowDateTime = UaDateTime.utcNow();
                        nowDateTime.addHours( w );
                        arrayWriteValues[w] = nowDateTime;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setDateTimeArray( arrayWriteValues );
                    break;

                case BuiltInType.Double:
                    arrayWriteValues = new UaDoubles();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = 0.5 * w;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setDoubleArray( arrayWriteValues );
                    break;

                case BuiltInType.Float:
                    arrayWriteValues = new UaFloats();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = 1.1 * w;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setFloatArray( arrayWriteValues );
                    break;

                case BuiltInType.Guid:
                    arrayWriteValues = new UaGuids();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = new UaGuid();
                    }
                    writeReq.NodesToWrite[0].Value.Value.setGuidArray( arrayWriteValues );
                    break;

                case BuiltInType.Int16:
                    arrayWriteValues = new UaInt16s();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = 10 + w;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setInt16Array( arrayWriteValues );
                    break;

                case BuiltInType.Int32:
                    arrayWriteValues = new UaInt32s();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = 100 + w;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setInt32Array( arrayWriteValues );
                    break;

                case BuiltInType.Int64:
                    arrayWriteValues = new UaInt64s();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = 100000 + w;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setInt64Array( arrayWriteValues );
                    break;

                case BuiltInType.String:
                    arrayWriteValues = new UaStrings();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = "Hello World CTT 5.8.2-006.js # " + w;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setStringArray( arrayWriteValues );
                    break;

                case BuiltInType.SByte:
                    arrayWriteValues = new UaSBytes();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = w;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setSByteArray( arrayWriteValues );
                    break;

                case BuiltInType.UInt16:
                    arrayWriteValues = new UaUInt16s();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = 10 + w;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setUInt16Array( arrayWriteValues );
                    break;

                case BuiltInType.UInt32:
                    arrayWriteValues = new UaUInt32s();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = 10 + w;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setUInt32Array( arrayWriteValues );
                    break;

                case BuiltInType.UInt64:
                    arrayWriteValues = new UaUInt64s();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = 10 + w;
                    }
                    writeReq.NodesToWrite[0].Value.Value.setUInt64Array( arrayWriteValues );
                    break;
                case BuiltInType.XmlElement:
                    arrayWriteValues = new UaXmlElements();
                    for( w=0; w<valueAsArray.length; w++ )
                    {
                        arrayWriteValues[w] = new UaXmlElement();
                        arrayWriteValues[w].setString( "<a" + w + ">hello</a" + w + ">" );
                    }
                    writeReq.NodesToWrite[0].Value.Value.setXmlElementArray( arrayWriteValues );
                    break;
                default:
                    break;
            }//switch

            //WRITE the nodes.
            addLog( "\nWriting ARRAY node: '" + item.NodeId + "' Values: " + writeReq.NodesToWrite[0].Value.toString() );
            uaStatus = g_session.write( writeReq, writeRes );

            // check result
            if( uaStatus.isGood() )
            {
                // check the response is good. This also calls compareWritesToRead();
                checkWriteValidParameter( writeReq, writeRes, true, [item.NodeSetting], OPTIONAL_CONFORMANCEUNIT );
            }
            else
            {
                addError( "Write(): status " + uaStatus, uaStatus );
            }
        }
        else
        {
            addError( "Read Validation FAILED. Node: '" + item.NodeId + "', Type: " + BuiltInType.toString( item.DataType ) );
        }
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

function write582009()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0 );
    if( items === null || items.length < 1 )
    {
        addSkipped( "Arrays" );
        return;
    }
    // now to test each item
    for( var i=0; i<items.length; i++ )
    {
        writeArray582009( items[i] );
    }
    // revert to original values 
    revertToOriginalValues();
}

safelyInvoke( write582009 );