/*  Test 5.8.2 Test 17; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write the minimum value for each supported data-type.

    Revision History
        24-Sep-2009 Dev: Initial version.
        16-Nov-2009 NP : REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582015()
{
    var dataTypeNodeNames = NodeIdSettings.ScalarStatic();

    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader(writeReq.RequestHeader);

    //stores the number of the node we're currently working on.
    var currentNodeNumber = -1;

    //dynamically construct IDs of nodes to write, specifically their values.
    for( var i=0; i<dataTypeNodeNames.length; i++ )
    {
        //get the value of the setting, and make sure it contains a value
        var settingValue = readSetting( dataTypeNodeNames[i] );
        if( settingValue.toString() == "undefined" )
        {
            continue;
        }

        if( settingValue.toString().length > 0 )
        {

            writeReq.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.Value;
            writeReq.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();

            switch( dataTypeNodeNames[i] )
            {
                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setBoolean( false );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setByte( Constants.Byte_Min );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setByteString( UaByteString.fromStringData( "CTT 5.8.2-017" ) );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setDateTime( new UaDateTime( 0 ) );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Double":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setDouble( Constants.Double_Min );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Float":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setFloat( Constants.Float_Min );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setGuid( UaGuid.fromString( "{A8F5889C-9B39-474f-9DE1-9BF5DC230D63}" ) );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setInt16( Constants.Int16_Min );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setInt32( Constants.Int32_Min );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setInt64( Constants.Int64_Min );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/String":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setString( "" );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/SByte":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setSByte( Constants.SByte_Min );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setUInt16( Constants.UInt16_Min );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setUInt32( Constants.UInt32_Min );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setUInt64( Constants.UInt64_Min );
                    break;

                case "/Server Test/NodeIds/Static/All Profiles/Scalar/XmlElement":
                    writeReq.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                    var xmle = new UaXmlElement();
                    xmle.setString( "<uactt>a</uactt>" );
                    writeReq.NodesToWrite[currentNodeNumber].Value.Value.setXmlElement( xmle );
                    break;

                default:
                    break;
            }//switch
            
        }//if( settingValue.toString().length > 0 )
    }//for

    //WRITE the nodes.
    print( "\nWRITING to " + writeReq.NodesToWrite.length + " nodes..." );
    for( var w=0; w<writeReq.NodesToWrite.length; w++ )
    {
        print( "\t" + w + ".) Node: '" + dataTypeNodeNames[w] + "'; Value: '" + writeReq.NodesToWrite[w].Value.toString() + "'" );
    }
    uaStatus = g_session.write( writeReq, writeRes );

    // check result
    if( uaStatus.isGood() )
    {
        checkWriteValidParameter( writeReq, writeRes, true, undefined, OPTIONAL_CONFORMANCEUNIT );
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582015 );