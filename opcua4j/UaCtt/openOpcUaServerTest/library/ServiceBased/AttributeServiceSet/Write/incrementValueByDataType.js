function incrementValueByDataType( dataType, currentValue )
{
    var n;
    switch( dataType )
    {
        case BuiltInType.Null: break;
        case BuiltInType.Boolean: n = !currentValue; break;
        case BuiltInType.SByte: n = currentValue+1; break;
        case BuiltInType.Byte: n = currentValue+1; break;
        case BuiltInType.Int16: n = currentValue+1; break;
        case BuiltInType.UInt16: n = currentValue+1; break;
        case BuiltInType.Int32: n = currentValue+1; break;
        case BuiltInType.UInt32: n = currentValue+1; break;
        case BuiltInType.Int64: n = currentValue+1; break;
        case BuiltInType.UInt64: n = currentValue+1; break;
        case BuiltInType.Float: n = currentValue+0.15; break;
        case BuiltInType.Double: n = currentValue+0.158; break;
        case BuiltInType.String: n = UaDateTime.utcNow().toString(); break;
        case BuiltInType.DateTime: n = UaDateTime.utcNow(); break;
        case BuiltInType.Guid: n = new UaGuid(); break;
        case BuiltInType.ByteString: n = UaByteString.fromStringData( UaDateTime.utcNow().toString() ); break;
        case BuiltInType.XmlElement: n = "<xml1>" + UaDateTime.utcNow().toString() + "</xml1>"; break;
        default: throw( "incrementValueByDataType unable to process dataType: " + dataType + " (" + BuiltInType.toString( dataType ) + ")" );
    }
    return( n );
}