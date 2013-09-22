/*  Test 5.8.2 Test 4; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to the same node multiple times in the same call.

        This is done for each core data type:
            Bool, Byte, SByte, ByteString, DateTime, Decimal, 
            Double, Float, Guid, Int16, UInt16, Int32, UInt32, 
            Int64, UInt64, String

    Revision History
        24-Aug-2009 NP: Initial version.
        18-Sep-2009 NP: Added more core data types to what used to just be string.
        12-Nov-2009 NP: REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

// THIS FUNCTION WILL EXECUTE A WRITE AND WILL CHECK THE RESULTS ARE VALID
function multiWriteOfType( functionToExecute )
{
    var writeRequest = new UaWriteRequest();
    var writeResponse = new UaWriteResponse();
    g_session.buildRequestHeader( writeRequest.RequestHeader );

    // execute WHATEVER function was passed in
    functionToExecute( writeRequest );

    if( writeRequest.NodesToWrite.length === 0 )
    {
        return;
    }

    // do the write
    var uaStatus = g_session.write( writeRequest, writeResponse );

    // check result
    if( uaStatus.isGood() )
    {
        // we do NOT want this routine to validate our writes...
        // we need to handle that differently because in these writes we have been
        // writing to the same node multiple times, the read ONLY need to check
        // that the last value is correct!
        checkWriteValidParameter( writeRequest, writeResponse, false, undefined, OPTIONAL_CONFORMANCEUNIT );
        compareLastWriteToRead  ( writeRequest, writeResponse );
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

// THIS FUNCTION WILL WRITE A SPECIFIED VALUE IN THE SPECIFIC TYPE REQUESTED
function writeTypedValue( writeRequestHeader, index, settingName, nodeValue, dataType )
{
    // validate nodeSetting is a NodeId
    var nodeName = readSetting( settingName ).toString();
    var nodeId = null;
    if( nodeName !== "" )
    {
        nodeId = UaNodeId.fromString( nodeName );
        if( nodeId === null )
        {
            _warning.store( "Setting " + settingName + " is not a NodeId string: " + nodeName );
            return;
        }
    }
    else
    {
        _warning.store( "Setting not configured: '" + settingName + "'." );
        return;
    }

    writeRequestHeader.NodesToWrite[index].NodeId = nodeId;
    writeRequestHeader.NodesToWrite[index].AttributeId = Attribute.Value;
    writeRequestHeader.NodesToWrite[index].Value.Value = new UaVariant();
    switch( dataType )
    {
        case BuiltInType.Null:
            break;
        case BuiltInType.Boolean:
           writeRequestHeader.NodesToWrite[index].Value.Value.setBoolean( nodeValue );
           break;
        case BuiltInType.Byte:
            writeRequestHeader.NodesToWrite[index].Value.Value.setByte( nodeValue );
            break;
        case BuiltInType.ByteString:
            var byteStringValue = UaByteString.fromStringData( nodeValue );
            writeRequestHeader.NodesToWrite[index].Value.Value.setByteString( byteStringValue );
            break;
        case BuiltInType.DateTime:
            writeRequestHeader.NodesToWrite[index].Value.Value.setDateTime( nodeValue );
            break;
        case BuiltInType.Double:
            writeRequestHeader.NodesToWrite[index].Value.Value.setDouble( nodeValue );
            break;
        case BuiltInType.Float:
            writeRequestHeader.NodesToWrite[index].Value.Value.setFloat( nodeValue );
            break;
        case BuiltInType.Guid:
            var guidValue = UaGuid.fromString( nodeValue );
            writeRequestHeader.NodesToWrite[index].Value.Value.setGuid( guidValue );
            break;
        case BuiltInType.Int16:
            writeRequestHeader.NodesToWrite[index].Value.Value.setInt16( nodeValue );
            break;
        case BuiltInType.Int32:
            writeRequestHeader.NodesToWrite[index].Value.Value.setInt32( nodeValue );
            break;
        case BuiltInType.Int64:
            writeRequestHeader.NodesToWrite[index].Value.Value.setInt64( nodeValue );
            break;
        case BuiltInType.SByte:
           writeRequestHeader.NodesToWrite[index].Value.Value.setSByte( nodeValue );
           break;
        case BuiltInType.String:
            writeRequestHeader.NodesToWrite[index].Value.Value.setString( nodeValue );
            break;
        case BuiltInType.UInt16:
            writeRequestHeader.NodesToWrite[index].Value.Value.setUInt16( nodeValue );
            break;
        case BuiltInType.UInt32:
            writeRequestHeader.NodesToWrite[index].Value.Value.setUInt32( nodeValue );
            break;
        case BuiltInType.UInt64:
            writeRequestHeader.NodesToWrite[index].Value.Value.setUInt64( nodeValue );
            break;
        default:
            break;
    }
}

// THE FOLLOWING FUNCTIONS DEFINE THE NODES AND THE VALUES TO WRITE...
function writeBools( writeRequest )
{
    addLog( "\nBoolean writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool", false, BuiltInType.Boolean );
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool", true, BuiltInType.Boolean );
}
function writeBytes( writeRequest )
{
    addLog( "\nByte writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte", 0, BuiltInType.Byte );
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte", 64, BuiltInType.Byte );
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte", 128, BuiltInType.Byte );
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte", 256, BuiltInType.Byte );
    writeTypedValue( writeRequest, 4, "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte", 511, BuiltInType.Byte );
}
function writeByteStrings( writeRequest )
{
    addLog( "\nByteString writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString", "CTT 5.8.2-004 (1)", BuiltInType.ByteString);
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString", "CTT 5.8.2-004 (2)", BuiltInType.ByteString);
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString", "CTT 5.8.2-004 (3)", BuiltInType.ByteString);
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString", "CTT 5.8.2-004 (4)", BuiltInType.ByteString);
}
function writeDateTimes( writeRequest )
{
    addLog( "\nDateTime writes" );
    var currentTime = UaDateTime.utcNow();
    var myTime = currentTime.clone();
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime", myTime, BuiltInType.DateTime);

    myTime.addMilliSeconds(256);
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime", myTime, BuiltInType.DateTime);

    myTime.addSeconds( 55 );
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime", myTime, BuiltInType.DateTime);
    
    myTime.addDays( 4 );
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime", myTime, BuiltInType.DateTime);
}
function writeDoubles( writeRequest )
{
    addLog( "\nDouble writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/Double", 0.000009, BuiltInType.Double);
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/Double", 1.300009, BuiltInType.Double);
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/Double", 7.123456, BuiltInType.Double);
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/Double", 9.000009, BuiltInType.Double);
    writeTypedValue( writeRequest, 4, "/Server Test/NodeIds/Static/All Profiles/Scalar/Double", 1230.091, BuiltInType.Double);
}
function writeFloats( writeRequest )
{
    addLog( "\nFloat writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/Float", 0.000009, BuiltInType.Float);
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/Float", 1.123123, BuiltInType.Float);
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/Float", 6.239822, BuiltInType.Float);
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/Float", 9.123872, BuiltInType.Float);
}
function writeGuids( writeRequest )
{
    addLog( "\nGuid writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid", "{A8F5889C-9B39-474f-9DE1-9BF5DC230D63}", BuiltInType.Guid);
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid", "{ECCC5496-6424-4ded-AC5C-4C616C23FB6A}", BuiltInType.Guid);
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid", "{A0480087-D45F-44ec-BEB2-653C51E312F0}", BuiltInType.Guid);
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid", "{110A379B-7BD0-4799-879A-8D7005080BF5}", BuiltInType.Guid);
}
function writeInt16s( writeRequest )
{
    addLog( "\nInt16 writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16", 0, BuiltInType.Int16);
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16", -20000, BuiltInType.Int16);
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16", -32765, BuiltInType.Int16);
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16", 20000, BuiltInType.Int16);
    writeTypedValue( writeRequest, 4, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16", 32768, BuiltInType.Int16);
}
function writeInt32s( writeRequest )
{
    addLog( "\nInt32 writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32", 0, BuiltInType.Int32);
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32", -2000000, BuiltInType.Int32);
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32", -3002765, BuiltInType.Int32);
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32", 2000000, BuiltInType.Int32);
    writeTypedValue( writeRequest, 4, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32", 3002768, BuiltInType.Int32);
}
function writeInt64s( writeRequest )
{
    addLog( "\nInt64 writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64", 0, BuiltInType.Int64);
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64", -200000000, BuiltInType.Int64);
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64", -300002765, BuiltInType.Int64);
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64", 200000000, BuiltInType.Int64);
    writeTypedValue( writeRequest, 4, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64", 300002768, BuiltInType.Int64);
}
function writeUInt16s( writeRequest )
{
    addLog( "\nUInt16 writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16", 0, BuiltInType.UInt16);
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16", -20000, BuiltInType.UInt16);
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16", -32765, BuiltInType.UInt16);
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16", 20000, BuiltInType.UInt16);
    writeTypedValue( writeRequest, 4, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16", 32768, BuiltInType.UInt16);
}
function writeUInt32s( writeRequest )
{
    addLog( "\nUInt32 writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32", 0, BuiltInType.UInt32);
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32", -2000000, BuiltInType.UInt32);
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32", -3002765, BuiltInType.UInt32);
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32", 2000000, BuiltInType.UInt32);
    writeTypedValue( writeRequest, 4, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32", 3002768, BuiltInType.UInt32);
}
function writeUInt64s( writeRequest )
{
    addLog( "\nUInt64 writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64", 0, BuiltInType.UInt64);
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64", -200000000, BuiltInType.UInt64);
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64", -300002765, BuiltInType.UInt64);
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64", 200000000, BuiltInType.UInt64);
    writeTypedValue( writeRequest, 4, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64", 300002768, BuiltInType.UInt64);
}
function writeSBytes( writeRequest )
{
    addLog( "\nSByte writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/SByte", 0, BuiltInType.SByte );
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/SByte", 10, BuiltInType.SByte );
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/SByte", 255, BuiltInType.SByte );
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/SByte", 511, BuiltInType.SByte );
}
function writeStrings( writeRequest )
{
    addLog( "\nString writes" );
    writeTypedValue( writeRequest, 0, "/Server Test/NodeIds/Static/All Profiles/Scalar/String", "hello", BuiltInType.String );
    writeTypedValue( writeRequest, 1, "/Server Test/NodeIds/Static/All Profiles/Scalar/String", "world", BuiltInType.String );
    writeTypedValue( writeRequest, 2, "/Server Test/NodeIds/Static/All Profiles/Scalar/String", "OPC", BuiltInType.String );
    writeTypedValue( writeRequest, 3, "/Server Test/NodeIds/Static/All Profiles/Scalar/String", "UA", BuiltInType.String );
    writeTypedValue( writeRequest, 4, "/Server Test/NodeIds/Static/All Profiles/Scalar/String", "CTT", BuiltInType.String );
}

function write582004()
{
    // Actual Testing of the Data Types....
    multiWriteOfType( writeBools );
    multiWriteOfType( writeBytes );
    multiWriteOfType( writeByteStrings );
    multiWriteOfType( writeDateTimes );
    multiWriteOfType( writeDoubles );
    multiWriteOfType( writeFloats );
    multiWriteOfType( writeGuids );
    multiWriteOfType( writeInt16s );
    multiWriteOfType( writeInt32s );
    multiWriteOfType( writeInt64s );
    multiWriteOfType( writeUInt16s );
    multiWriteOfType( writeUInt32s );
    multiWriteOfType( writeUInt64s );
    multiWriteOfType( writeSBytes );
    multiWriteOfType( writeStrings );
}

safelyInvoke( write582004 );