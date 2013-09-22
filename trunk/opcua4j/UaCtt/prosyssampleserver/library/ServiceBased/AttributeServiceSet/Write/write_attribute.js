function writeAttributeValue( session, nodeId, attributeId, baseDataTypeValue )
{
    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    session.buildRequestHeader( writeReq.RequestHeader );
    
    writeReq.NodesToWrite[0].NodeId = nodeId;
    writeReq.NodesToWrite[0].AttributeId = Attribute.Value;
    writeReq.NodesToWrite[0].Value.Value = baseDataTypeValue;
    
    session.write( writeReq, writeRes );

    // return the Write Results 
    return( writeRes );
}


function writeValueToValue( session, nodeId, baseDataTypeValueLocal )
{
    var writeResult = writeAttributeValue( session, nodeId, Attribute.Value, baseDataTypeValueLocal );
    return( writeResult );
}


function writeByteStringToValue( session, nodeId, uaByteString )
{
    var v = new UaVariant();
    v.setByteString( uaByteString );
    writeValueToValue( session, nodeId, v );
}


function writeStringToValue( session, nodeId, jsString )
{
    var v = new UaVariant();
    v.setString( jsString );
    writeValueToValue( session, nodeId, v );
}


function writeByteStringArrayToValue( session, nodeId, jsUaByteStringArray )
{
    var uaByteStringArray = new UaByteStrings();
    for( var i = 0; i < jsUaByteStringArray.length; i++ )
    {
        uaByteStringArray[i] = jsUaByteStringArray[i];
    }
    var v = new UaVariant();
    v.setByteStringArray( uaByteStringArray );
    writeValueToValue( session, nodeId, v );
}


function writeStringArrayToValue( session, nodeId, jsStringArray )
{
    var uaStringArray = new UaStrings();
    for( var i = 0; i < jsStringArray.length; i++ )
    {
        uaStringArray[i] = jsStringArray[i];
    }
    var v = new UaVariant();
    v.setStringArray( uaStringArray );
    writeValueToValue( session, nodeId, v );
}


// Given a UaVariant, set an initial value (zero in most cases).
function InitializeValue( value, dataType )
{
    switch( dataType )
    {
        case BuiltInType.Null:
            break;
        case BuiltInType.Boolean:
            value.setBoolean( false );
            break;
        case BuiltInType.Byte:
            value.setByte( 0 );
            break;
        case BuiltInType.ByteString:
            value.setByteString( UaByteString.fromStringData( "HelloWorld" ) );
            break;
        case BuiltInType.DateTime:
            value.setDateTime( UaDateTime.fromString( "1976-10-08T01:07:00.000-06:00" ) );
            break;
        case BuiltInType.Double:
            value.setDouble( 0.0 );
            break;
        case BuiltInType.Float:
            value.setFloat( 0.0 );
            break;
        case BuiltInType.Guid:
            value.setGuid( new UaGuid() );
            break;
        case BuiltInType.Int16:
            value.setInt16( 0 );
            break;
        case BuiltInType.Int32:
            value.setInt32( 0 );
            break;
        case BuiltInType.Int64:
            value.setInt64( 0 );
            break;
        case BuiltInType.SByte:
           value.setSByte( 0 );
           break;
        case BuiltInType.String:
            value.setString( "HelloWorld" );
            break;
        case BuiltInType.UInt16:
            value.setUInt16( 0 );
            break;
        case BuiltInType.UInt32:
            value.setUInt32( 0 );
            break;
        case BuiltInType.UInt64:
            value.setUInt64( 0 );
            break;
        case BuiltInType.XmlElement:
            var xmle = new UaXmlElement();
            xmle.setString( "<uactt>" + UaDateTime.utcNow() + "</uactt>" );
            value.setXmlElement( xmle );
            break;
        default:
            break;
    }
}


// Given a scalar UaVariant, set a value.
function GenerateScalarValue( value, dataType, offset )
{
    if( offset === undefined )
    {
        offset = new Date().getSeconds(); // use this to get current Second, use it to generate different values
    }
    var temp;
    
    switch( dataType )
    {
        case BuiltInType.Null:
            break;
        case BuiltInType.Boolean:
            value.setBoolean( offset % 2 );
            break;
        case BuiltInType.Byte:
            value.setByte( 129 + offset );
            break;
        case BuiltInType.ByteString:
            temp = "0x";
            for( var i=0; i<2+offset; i++ )
            {
                temp += ( 16 + Math.abs( offset ) + i ).toString(16);
                if( temp.length % 2 === 1 )
                {
                    temp += "0";
                }
            }
            value.setByteString( new UaByteString( temp ) );
            break;
        case BuiltInType.DateTime:
            var dateTime = UaDateTime.utcNow();
            dateTime.addHours( -offset );
            value.setDateTime( dateTime );
            break;
        case BuiltInType.Double:
            value.setDouble( 3.1415926536 + offset );
            break;
        case BuiltInType.Float:
            value.setFloat( 3.1416 + offset );
            break;
        case BuiltInType.Guid:
            temp = "{A48A8B6C-7C12-4C51-B830-2E436329" + ( 40960 + offset ).toString(16) + "}";
            value.setGuid( new UaGuid( temp ) );
            break;
        case BuiltInType.Int16:
            value.setInt16( 2009 + offset );
            break;
        case BuiltInType.Int32:
            value.setInt32( 200912 + offset );
            break;
        case BuiltInType.Int64:
            value.setInt64( 200912021339 + offset );
            break;
        case BuiltInType.SByte:
           value.setSByte( 4 + offset );
           break;
        case BuiltInType.String:
            value.setString( "UA CTT Script " + offset );
            break;
        case BuiltInType.UInt16:
            value.setUInt16( 60001 + offset );
            break;
        case BuiltInType.UInt32:
            value.setUInt32( 120001 + offset );
            break;
        case BuiltInType.UInt64:
            value.setUInt64( 200912021341 + offset );
            break;
        case BuiltInType.XmlElement:
            value.setXmlElement( new UaXmlElement( "<uactt>script " + offset + "</uactt>" ) );
            break;
        default:
            break;
    }
}

// Function: Returns the max value of the given datatype
function getMaxValueDataType ( dataType )
{
    switch ( dataType )
    {
        case BuiltInType.Byte:
            return ( Constants.Byte_Max );
            break;
        case BuiltInType.SByte:
            return ( Constants.SByte_Max );
            break;
        case BuiltInType.Double:
            return ( Constants.Double_Max );
            break;
        case BuiltInType.Float:
            return ( Constants.Float_Max );
            break;
        case BuiltInType.Int16:
            return ( Constants.Int16_Max );
            break;
        case BuiltInType.Int32:
            return ( Constants.Int32_Max );
            break;
        case BuiltInType.Int64:
            return ( Constants.Int32_Max );
            break;
        case BuiltInType.UInt16:
            return ( Constants.UInt16_Max );
            break;
        case BuiltInType.UInt32:
            return ( Constants.UInt32_Max );
            break;
        case BuiltInType.UInt64:
            return ( Constants.UInt32_Max );
            break;
        case BuiltInType.DateTime:
            return UaDateTime.fromString( "9999-12-31T23:59:59.999Z" );
            break;
        case BuiltInType.String:
            var i, s = "";
            for( i = 0; i < 100; i++ )
            {
                s += ( i % 10 ).toString();
            }
            return s;
            break;
        default:
            throw ( "Max value requested for invalid datatype." );
    }
}

// Function: Returns the min value of the given datatype
function getMinValueDataType ( dataType )
{
    switch ( dataType )
    {
        case BuiltInType.Byte:
            return ( Constants.Byte_Min );
            break;
        case BuiltInType.SByte:
            return ( Constants.SByte_Min );
            break;
        case BuiltInType.Double:
            return ( Constants.Double_Min );
            break;
        case BuiltInType.Float:
            return ( Constants.Float_Min );
            break;
        case BuiltInType.Int16:
            return ( Constants.Int16_Min );
            break;
        case BuiltInType.Int32:
            return ( Constants.Int32_Min );
            break;
        case BuiltInType.Int64:
            return ( Constants.Int32_Min );
            break;            
        case BuiltInType.UInt16:
            return ( Constants.UInt16_Min );
            break;
        case BuiltInType.UInt32:
            return ( Constants.UInt32_Min );
            break;
        case BuiltInType.UInt64:
            return ( Constants.UInt32_Min );
            break;
        case BuiltInType.DateTime:
            return new UaDateTime();
            break;
        case BuiltInType.String:
            return "";
            break;
        default:
            throw ( "Min value requested for invalid datatype." );
    }    
}

// Function: Returns the a value in the middle of the given datatype
function getMiddleValueDataType ( dataType )
{
    var middleValue;
    switch ( dataType )
    {
        case BuiltInType.Byte:
            middleValue = Constants.Byte_Min + ((Constants.Byte_Max - Constants.Byte_Min)/2);
            break;
        case BuiltInType.SByte:
            middleValue = Constants.SByte_Min + ((Constants.SByte_Max - Constants.SByte_Min)/2);
            break;
        case BuiltInType.Double:
            middleValue = Constants.Double_Min + ((Constants.Double_Max - Constants.Double_Min)/2);
            break;
        case BuiltInType.Float:
            middleValue = Constants.Float_Min + ((Constants.Float_Max - Constants.Float_Min)/2);
            break;
        case BuiltInType.Int16:
            middleValue = Constants.Int16_Min + ((Constants.Int16_Max - Constants.Int16_Min)/2);
            break;
        case BuiltInType.Int32:
            middleValue = Constants.Int32_Min + ((Constants.Int32_Max - Constants.Int32_Min)/2);
            break;
        case BuiltInType.Int64:
            middleValue = Constants.Int32_Min + ((Constants.Int32_Max - Constants.Int32_Min)/2);
            break;            
        case BuiltInType.UInt16:
            middleValue = Constants.UInt16_Min + ((Constants.UInt16_Max - Constants.UInt16_Min)/2);
     break;
        case BuiltInType.UInt32:
            middleValue = Constants.UInt32_Min + ((Constants.UInt32_Max - Constants.UInt32_Min)/2);
     break;
        case BuiltInType.UInt64:
            middleValue = Constants.UInt32_Min + ((Constants.UInt32_Max - Constants.UInt32_Min)/2);
     break;     
        case BuiltInType.DateTime:
            middleValue = UaDateTime.fromString( "5800-07-01T12:01:01.001Z" );
            break;
        case BuiltInType.String:
            var i, middleValue = "";
            for( i = 0; i < 100; i++ )
            {
                middleValue += ( i % 10 ).toString();
            }
            break;
        default:
            throw ( "Middle value requested for invalid datatype." );
    }
    
    // Return value
    return ( middleValue );
}
