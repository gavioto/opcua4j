/*  byteStringFromText - is a helper method that will take a string and convert 
    it to a UaByteString object, which is then returned to the caller.
*/
function byteStringFromText( text )
{
    var bsStr = "0x";
    if( text == undefined || text == null ) text = "";
    for( var i=0; i<text.length; i++ )
    {
        var charcode = text.charCodeAt( i );
        var charHex  = charcode.toString( 16 );
        bsStr += charHex;
    }
    var uabs = new UaByteString( bsStr );
    return( uabs );
}
/* //Test code for byteStringFromText() function
var bs = byteStringFromText();
print( "bs (empty) = " + bs.toString() );
bs = byteStringFromText( "" );
print( "bs (\"\") = " + bs.toString() );
bs = byteStringFromText ( "hello world" );
print( "bs (\"hello world\") = " + bs.toString() );
*/

/* UaVariantToSimpleType extracts the Value from a UaVariant object and casts it to
   the applicable/native datatype of JavaScript, making for much more safe and reliable
   data conversions etc.
   
   Example usage:
       uaStatus = g_session.read( readReq, readRes );
       if( uaStatus.isGood() )
       {
           var var1 = UaVariantToSimpleType( readRes.Results[0].Value );
       }
*/
function UaVariantToSimpleType( uaValue )
{
    if( uaValue.ArrayType === 1 )
    {
        return( GetArrayTypeToNativeType( uaValue ) );
    }

    switch( uaValue.DataType )
    {
        case BuiltInType.Boolean:
            return( uaValue.toBoolean() );
            break;
        case BuiltInType.Byte:
            return( uaValue.toByte() );
            break;
        case BuiltInType.ByteString:
            return( uaValue.toByteString() );
            break;
        case BuiltInType.DateTime:
            return( uaValue.toDateTime() );
            break;
        case BuiltInType.Double:
            return( uaValue.toDouble() );
            break;
        case BuiltInType.Float:
            return( uaValue.toFloat() );
            break;
        case BuiltInType.Guid:
            return( uaValue.toGuid() );
            break;
        case BuiltInType.Int16:
            return( uaValue.toInt16() );
            break;
        case BuiltInType.Int32:
            return( uaValue.toInt32() );
            break;
        case BuiltInType.Int64:
            return( uaValue.toInt64() );
            break;
        case BuiltInType.SByte:
            return( uaValue.toSByte() );
            break;
        case BuiltInType.String:
            return( uaValue.toString() );
            break;
        case BuiltInType.UInt16:
            return( uaValue.toUInt16() );
            break;
        case BuiltInType.UInt32:
            return( uaValue.toUInt32() );
            break;
        case BuiltInType.UInt64:
            return( uaValue.toUInt64() );
            break;
        case BuiltInType.XmlElement:
            return( uaValue.toXmlElement() );
            break;
        default:
            return( uaValue );
            break;
    }
}

function IncrementUaVariant( uaValue )
{
    switch( uaValue.DataType )
    {
        case BuiltInType.Boolean:
            return( !uaValue.toBoolean() );
            break;
        case BuiltInType.Byte:
            return( 1 + uaValue.toByte() );
            break;
        case BuiltInType.ByteString:
            var bs = UaByteString.fromString( "-" + uaValue.toByteString().toString() );
            return( bs.fromByteString() );
            break;
        case BuiltInType.DateTime:
            var dt = uaValue.toDateTime();
            dt.addDays(1);
            return( dt );
            break;
        case BuiltInType.Double:
            return( uaValue.toDouble() + 1.1 );
            break;
        case BuiltInType.Float:
            return( uaValue.toFloat() + 1.1 );
            break;
        case BuiltInType.Guid:
            return( uaValue.toGuid() );
            break;
        case BuiltInType.Int16:
            return( uaValue.toInt16() + 1 );
            break;
        case BuiltInType.Int32:
            return( uaValue.toInt32() + 1 );
            break;
        case BuiltInType.Int64:
            return( uaValue.toInt64() + 1 );
            break;
        case BuiltInType.SByte:
            return( uaValue.toSByte() + 1 );
            break;
        case BuiltInType.String:
            return( uaValue.toString() + "-" );
            break;
        case BuiltInType.UInt16:
            return( uaValue.toUInt16() + 1 );
            break;
        case BuiltInType.UInt32:
            return( uaValue.toUInt32() + 1 );
            break;
        case BuiltInType.UInt64:
            return( uaValue.toUInt64() + 1 );
            break;
        case BuiltInType.XmlElement:
            return( uaValue.toXmlElement() );
            break;
        default:
            return( uaValue );
            break;
    }
}

function IncrementUaVariantArray( uaValue, indexOffsetStart, indexOffsetEnd, incValue )
{
    if( indexOffsetEnd === undefined || indexOffsetEnd === null ) indexOffsetEnd = 1 + indexOffsetStart;
    if( incValue === undefined || incValue === null ) incValue = 1;
    var x;
    for( var i=indexOffsetStart; i<indexOffsetEnd; i++ )
    {
        switch( uaValue.DataType )
        {
            case BuiltInType.Boolean:
                x = uaValue.toBooleanArray();
                x[i] = !x[i];
                uaValue.setBooleanArray( x );
                break;
            case BuiltInType.Byte:
                x = uaValue.toByteArray();
                x[i] += incValue;
                uaValue.setByteArray( x );
                break;
            case BuiltInType.Double:
                x = uaValue.toDoubleArray();
                x[i] += incValue;
                uaValue.setDoubleArray( x );
                break;
            case BuiltInType.Float:
                x = uaValue.toFloatArray();
                x[i] += incValue;
                uaValue.setFloatArray( x );
                break;
            case BuiltInType.Int16:
                x = uaValue.toInt16Array();
                x[i] += incValue;
                uaValue.setInt16Array( x );
                break;
            case BuiltInType.Int32:
                x = uaValue.toInt32Array();
                x[i] += incValue;
                uaValue.setInt32Array( x );
                break;
            case BuiltInType.Int64:
                x = uaValue.toInt64Array();
                x[i] += incValue;
                uaValue.setInt64Array( x );
                break;
            case BuiltInType.SByte:
                x = uaValue.toSByteArray();
                var n = x[i] + incValue;
                if( n === x[i] )
                {
                    var s = x[i].toString().charCodeAt( 0 );
                    n = s + incValue;
                };
                x[i] = n;
                uaValue.setSByteArray( x );
                break;
            case BuiltInType.UInt16:
                x = uaValue.toUInt16Array();
                x[i] += incValue;
                uaValue.setUInt16Array( x );
                break;
            case BuiltInType.UInt32:
                x = uaValue.toUInt32Array();
                x[i] += incValue;
                uaValue.setUInt32Array( x );
                break;
            case BuiltInType.UInt64:
                x = uaValue.toUInt64Array();
                var n = x[i] + incValue;
                if( n === x[i] ) n = 1;
                x[i] = n;
                uaValue.setUInt64Array( x );
                break;
            default:
                break;
        }
    }
}
/* GetArrayTypeToNativeType extracts the Value from a UaVariant object and casts it to 
   the applicable/native datatype of JavaScript, where the value is an array,
   making for more safe and reliabled data conversions etc.
   
   Example usage:
   uaStatus = g_session.read( readReq, readRes );
       if( uaStatus.isGood() )
       {
           var var1 = GetArrayTypeToNativeType( readRes.Results[0].Value );
           for( var i=0; i<var1.length; i++ )
           {
               print( var1[i] );
           }
       }
*/
function GetArrayTypeToNativeType( uaValue )
{
    var returnValue = null;
    if( !( uaValue == null || uaValue == BuiltInType.Null ) )
    {
        switch( uaValue.DataType )
        {
            case BuiltInType.Boolean:
                returnValue = uaValue.toBooleanArray();
                break;
            case BuiltInType.Byte:
                returnValue = uaValue.toByteArray();
                break;
            case BuiltInType.ByteString:
                if( uaValue.ArrayType === 1 )
                {
                    returnValue = uaValue.toByteStringArray();
                }
                else
                {
                    returnValue = uaValue.toByteString();
                }
                break;
            case BuiltInType.DateTime:
                returnValue = uaValue.toDateTimeArray();
                break;
            case BuiltInType.Double:
                returnValue = uaValue.toDoubleArray();
                break;
            case BuiltInType.Float:
                returnValue = uaValue.toFloatArray();
                break;
            case BuiltInType.Guid:
                returnValue = uaValue.toGuidArray();
                break;
            case BuiltInType.Int16:
                returnValue = uaValue.toInt16Array();
                break;
            case BuiltInType.Int32:
                returnValue = uaValue.toInt32Array();
                break;
            case BuiltInType.Int64:
                returnValue = uaValue.toInt64Array();
                break;
            case BuiltInType.SByte:
                returnValue = uaValue.toSByteArray();
                break;
            case BuiltInType.String:
                returnValue = uaValue.toStringArray();
                break;
            case BuiltInType.UInt16:
                returnValue = uaValue.toUInt16Array();
                break;
            case BuiltInType.UInt32:
                returnValue = uaValue.toUInt32Array();
                break;
            case BuiltInType.UInt64:
                returnValue = uaValue.toUInt64Array();
                break;
            case BuiltInType.XmlElement:
                returnValue = uaValue.toXmlElementArray();
                break;
            default:
                throw( "Built in type not specified or detectable within the parameter." )
        }
    }//if...
    return( returnValue );
}

// Simply extracts the DATA portion from a ByteString, and returns as a String
function GetDataFromByteString( uaValue )
{
    // if a UaVariant was passed in, just grab the Value.
    if( uaValue.Value !== undefined )
    {
        uaValue = uaValue.Value.toString();
    }
    else
    {
        uaValue = uaValue.toString();
    }
    var indexOfData = uaValue.lastIndexOf( "=" );
    if( indexOfData < 0 )
        return( "" );
    var dataPortion = uaValue.substring( 1 + indexOfData );
    return( dataPortion );
}


// Simple function that returns TRUE/FALSE if the specified value (pass in a 
// UaVariant object) is already at the max value.
function IsValueAtMax( uaValue )
{
    if( uaValue == null || uaValue == BuiltInType.Null ||
        uaValue.DataType === undefined || uaValue.ArrayType === undefined )
    {
        return( false );
    }
    switch( uaValue.DataType )
    {
        case BuiltInType.Boolean:
            return( uaValue.toBoolean() === true );
        case BuiltInType.Byte:
            return( uaValue.toByte() === Constants.Byte_Max );
        case BuiltInType.ByteString:
            return( uaValue.toByteString().length === 0 );
        case BuiltInType.Double:
            return( uaValue.toDouble() === Constants.Double_Max );
        case BuiltInType.Float:
            return( uaValue.toFloat() === Constants.Float_Max );
        case BuiltInType.Int16:
            return( uaValue.toInt16() === Constants.Int16_Max );
        case BuiltInType.Int32:
            return( uaValue.toInt32() === Constants.Int32_Max );
            break;
        case BuiltInType.Int64:
            return( uaValue.toInt64() === Constants.Int64_Max );
        case BuiltInType.SByte:
            return( uaValue.toSByte() === Constants.SByte_Max );
        case BuiltInType.UInt16:
            return( uaValue.toUInt16() === Constants.UInt16_Max );
        case BuiltInType.UInt32:
            return( uaValue.toUInt32() === Constants.UInt32_Max );
        case BuiltInType.UInt64:
            return( uaValue.toUInt64() === Constants.UInt64_Max );
    }
}
/*/ test code for IsValueAtMax()
function printVal( msg, func, minVal, maxVal )
{
    func( minVal );
    var r1 = IsValueAtMax( v );
    func( maxVal );
    var r2 = IsValueAtMax( v );
    print( msg + " when value=" + minVal + " then isMax=" + r1 + "; but when value=" + maxVal + " the isMax=" + r2 );
}
var v = new UaVariant();
printVal( "Boolean", v.setBoolean, false, true );
printVal( "Byte", v.setByte, Constants.Byte_Min, Constants.Byte_Max );
printVal( "Double", v.setDouble, Constants.Double_Min, Constants.Double_Max );
printVal( "Float", v.setFloat, Constants.Float_Min, Constants.Float_Max );
printVal( "Int16", v.setInt16, Constants.Int16_Min, Constants.Int16_Max );
printVal( "Int32", v.setInt32, Constants.Int32_Min, Constants.Int32_Max );
printVal( "Int64", v.setInt64, Constants.Int64_Min, Constants.Int64_Max );
printVal( "SByte", v.setSByte, Constants.SByte_Min, Constants.SByte_Max );
printVal( "UInt16", v.setUInt16, Constants.UInt16_Min, Constants.UInt16_Max );
printVal( "UInt32", v.setUInt32, Constants.UInt32_Min, Constants.UInt32_Max );
printVal( "UInt64", v.setUInt64, Constants.UInt64_Min, Constants.UInt64_Max );
//*/