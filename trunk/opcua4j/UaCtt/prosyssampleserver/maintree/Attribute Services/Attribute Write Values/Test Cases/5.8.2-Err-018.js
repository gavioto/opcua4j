/*  Test 5.8.2 Error Test 18; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to a value using the wrong data-type:
            Sent value of Type -> to the wrong node of Type
                • Int16 -> Bool
                • Int32-> Byte
                • Int64-> Float
                • UInt16-> String
                • UInt32-> DateTime
                • UInt64 -> decimal
                • String -> bool
                • Byte -> XmlElement
                • Guid -> UInt32
                • SByte -> DateTime

    Revision History
        29-Sep-2009 NP: Initial version.
        16-Nov-2009 NP: REVIEWED.
        26-Nov-2009 DP: Changed some addLogs to prints (to be consistent).

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582018()
{
    var dataTypeNodeNames = NodeIdSettings.ScalarStatic();

    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader( writeReq.RequestHeader );

    //stores the number of the node we're currently working on.
    var currentNodeNumber = 0;
    var expectedResults = [];

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

            expectedResults[currentNodeNumber] = new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch );

            writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue );
            writeReq.NodesToWrite[currentNodeNumber].AttributeId = Attribute.Value;
            writeReq.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();

            // this variable will contain the SPECIFIC UA object that will 
            // then be passed to the WRITE call.
            switch( dataTypeNodeNames[i] )
            {
                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool": // receives Int16
                    print( "Will write an Int16 value to a Boolean Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setInt16( 55 );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte": // receives XmlElement
                    print( "Will write an XmlElement value to a Byte Value attribute" );
                    var xmle = new UaXmlElement();
                    xmle.setString( "<xmla>5.8.2-Err-018.js</xmla>" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setXmlElement( xmle );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString": // receives bool
                    print( "Will write a Boolean value to a ByteString Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setBoolean( false );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime": // receives UInt32
                    print( "Will write a UInt32 value to a DateTime Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setUInt32( 999999 );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Double": // receives DateTime
                    print( "Will write a DateTime value to a Double Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setDateTime( UaDateTime.utcNow() );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Float": // receives UInt64
                    print( "Will write a UInt64 value to a Float Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setUInt64( 999999999999 );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid": // receives Float
                    print( "Will write a Float value to a Guid Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setFloat( 1.23456789 );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16": // receives String
                    print( "Will write a non-numeric String value to an Int16 Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setString( "hello world 5.8.2-Err-020" );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32": // receives Guid
                    print( "Will write a Guid value to an Int32 Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setGuid( new UaGuid() );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64": // receives float
                    print( "Will write a Float value to an Int64 Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setFloat( 1.23456789 );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/String": // receives UInt16
                    print( "Will write a UInt16 value to a String Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setUInt16( 60000 );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/SByte": // receives Int32
                    print( "Will write an Int32 value to an SByte Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setInt32( Constants.Int32_Max );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16": // receives string
                    print( "Will write a non-numeric String value to a UInt16 Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setString( "hello world 5.8.2-Err-020" );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32": // receives Guid
                    print( "Will write a Guid value to a UInt32 Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setGuid( new UaGuid() );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64": // receives Float
                    print( "Will write a Float value to a UInt64 Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setFloat( 1.23456789 );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/XmlElement":
                    print( "Will write a Double value to a XmlElement Value attribute" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setDouble( 1.23456789 );
                    break;

                default:
                    print( "/n/n/t*** Unexpected Node received. Skipping '" + dataTypeNodeNames[i] + "'." );
                    break;
            }//switch
            currentNodeNumber++;
        }//if( settingValue.toString().length > 0 )
    }//for

    // print the contents of our write buffer
    print( "\nWill write the following:" );
    for( var i=0; i<writeReq.NodesToWrite.length; i++ )
    {
        print( "\t" + i + ".) Node '" + writeReq.NodesToWrite[i].NodeId + "' to receive value: '" + writeReq.NodesToWrite[i].Value.Value + "'." );
    }

    //WRITE the nodes.
    var uaStatus = g_session.write( writeReq, writeRes );
    if( uaStatus.isGood() )
    {
        checkWriteError( writeReq, writeRes, expectedResults, true, dataTypeNodeNames, OPTIONAL_CONFORMANCEUNIT );
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582018 );