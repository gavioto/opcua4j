/*  Test 5.8.2 Error Test 11; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to Invalid elements "2:1" of a Node.
        Do this for each core data-type.
        
    Revision History
        29-Sep-2009 NP: Initial version.
        11-Nov-2009 NP: REVIEWED.
        27-Nov-2009 DP: Prepopulate the test nodes' array values.
                        Validate the entire array after attempting to write to the test elements.
        13-May-2010 DP: Warn and stop test execution when no static array nodes are defined.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582Err011()
{
    const INDEXRANGETOWRITE = "2:1";
    const MIN_ARRAY_UBOUND = 2;

    var dataTypeNodeNames = NodeIdSettings.ArraysStatic();

    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader( writeReq.RequestHeader );

    //stores the number of the node we're currently working on.
    var currentNodeNumber = 0;
    var expectedResults = [];
    var startingArrays = []; // the values that will prepopulate each array

    //dynamically construct IDs of nodes to write, specifically their values.
    for( var i=0; i<dataTypeNodeNames.length; i++ )
    {
        //get the value of the setting, and make sure it contains a value
        var settingValue = readSetting( dataTypeNodeNames[i] ).toString();
        if( settingValue.toString() == "undefined" )
        {
            continue;
        }

        if( settingValue.toString().length > 0 )
        {
            expectedResults[currentNodeNumber] = new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeInvalid );

            writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue );
            writeReq.NodesToWrite[currentNodeNumber].AttributeId = Attribute.Value;
            writeReq.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
            writeReq.NodesToWrite[currentNodeNumber].IndexRange = INDEXRANGETOWRITE;

            // this variable will contain the SPECIFIC UA Array object that will 
            // then be passed to the WRITE call.
            var arrayWriteValues;
            var nodeType;
            switch( dataTypeNodeNames[i] )
            {
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Byte":
                    nodeType = BuiltInType.Byte;
                    arrayWriteValues = new UaBytes();
                    arrayWriteValues[0] = 0x0;
                    arrayWriteValues[1] = 0x1;
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setByteArray( arrayWriteValues );
                    break;
               
               case "/Server Test/NodeIds/Static/All Profiles/Arrays/SByte":
                    nodeType = BuiltInType.Byte;
                    arrayWriteValues = new UaSBytes();
                    arrayWriteValues[0] = 0x0;
                    arrayWriteValues[1] = 0x1;
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setSByteArray( arrayWriteValues );
                    break;
                
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Bool":
                    nodeType = BuiltInType.Boolean;
                    arrayWriteValues = new UaBooleans();
                    arrayWriteValues[0] = true;
                    arrayWriteValues[1] = false;
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setBooleanArray( arrayWriteValues );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Arrays/ByteString":
                    nodeType = BuiltInType.ByteString;
                    arrayWriteValues = new UaByteStrings();
                    arrayWriteValues[0] = "UA ByteString Test #1 5.8.2-006.js";
                    arrayWriteValues[1] = "UA ByteString Test #2 5.8.2-006.js";
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setByteStringArray( arrayWriteValues );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Arrays/DateTime":
                    nodeType = BuiltInType.DateTime;
                    arrayWriteValues = new UaDateTimes();
                    arrayWriteValues[0] = UaDateTime.utcNow();
                    arrayWriteValues[1] = arrayWriteValues[0].addHours(1);
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setDateTimeArray( arrayWriteValues );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Double":
                    nodeType = BuiltInType.Double;
                    arrayWriteValues = new UaDoubles();
                    arrayWriteValues[0] = 500;
                    arrayWriteValues[1] = 900;
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setDoubleArray( arrayWriteValues );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Float":
                    nodeType = BuiltInType.Float;
                    arrayWriteValues = new UaFloats();
                    arrayWriteValues[0] = 1.1;
                    arrayWriteValues[1] = 2.2;
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setFloatArray( arrayWriteValues );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Guid":
                    nodeType = BuiltInType.Guid;
                    arrayWriteValues = new UaGuids();
                    arrayWriteValues[0] = new UaGuid();
                    arrayWriteValues[1] = new UaGuid();
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setGuidArray( arrayWriteValues );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Int16":
                    nodeType = BuiltInType.Int16;
                    arrayWriteValues = new UaInt16s();
                    arrayWriteValues[0] = 5555;
                    arrayWriteValues[1] = 6666;
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setInt16Array( arrayWriteValues );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Int32":
                    nodeType = BuiltInType.Int32;
                    arrayWriteValues = new UaInt32s();
                    arrayWriteValues[0] = 555555;
                    arrayWriteValues[1] = 666666;
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setInt32Array( arrayWriteValues );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Int64":
                    nodeType = BuiltInType.Int64;
                    arrayWriteValues = new UaInt64s();
                    arrayWriteValues[0] = 555555555;
                    arrayWriteValues[1] = 666666666;
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setInt64Array( arrayWriteValues );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Arrays/String":
                    nodeType = BuiltInType.String;
                    arrayWriteValues = new UaStrings();
                    arrayWriteValues[0] = "Hello World #0, CTT 5.8.2-006.js";
                    arrayWriteValues[1] = "Hello World #1, CTT 5.8.2-006.js";
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setStringArray( arrayWriteValues );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt16":
                    nodeType = BuiltInType.UInt16;
                    arrayWriteValues = new UaUInt16s();
                    arrayWriteValues[0] = 55555;
                    arrayWriteValues[1] = 66666;
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setUInt16Array( arrayWriteValues );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt32":
                    nodeType = BuiltInType.UInt32;
                    arrayWriteValues = new UaUInt32s();
                    arrayWriteValues[0] = 55555;
                    arrayWriteValues[1] = 66666;
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setUInt32Array( arrayWriteValues );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt64":
                    nodeType = BuiltInType.UInt64;
                    arrayWriteValues = new UaUInt64s();
                    arrayWriteValues[0] = 55555;
                    arrayWriteValues[1] = 66666;
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setUInt64Array( arrayWriteValues );
                    break;

                case BuiltInType.XmlElement:
                    addLog( "[" + i + "] Will write to an array of XmlElements" );
                    arrayWriteValues = new UaXmlElements();
                    arrayWriteValues[0] = new UaXmlElement();
                    arrayWriteValues[0].setString( "<a>123</a>" );
                    arrayWriteValues[1] = new UaXmlElement();
                    arrayWriteValues[1].setString( "<b>123</b>" );
                    items[i].Value.Value.setXmlElementArray( arrayWriteValues );
                    break; 

                default:
                    break;
            }//switch
            
            // pre-populate array to test writing at a specific index range
            startingArrays[currentNodeNumber] = generateArrayWriteValue( 0, MIN_ARRAY_UBOUND, nodeType );
            writeValueToValue( g_session, writeReq.NodesToWrite[currentNodeNumber].NodeId, startingArrays[currentNodeNumber] );
            
            currentNodeNumber++;
        }//if( settingValue.toString().length > 0 )
    }//for

    if( writeReq.NodesToWrite.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }

    //WRITE the nodes.
    var uaStatus = g_session.write( writeReq, writeRes );
    if( uaStatus.isGood() )
    {
        if( checkWriteError( writeReq, writeRes, expectedResults, false, undefined, OPTIONAL_CONFORMANCEUNIT ) )
        {
            // validate entire array
            checkArraysAfterElementsWritten( g_session, writeReq, writeRes, startingArrays );
        }
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }

    // revert all nodes back to original values
    revertToOriginalValues();
}

safelyInvoke( write582Err011 );