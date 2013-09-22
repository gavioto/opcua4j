/*global BuiltInType, readSetting, UaBooleans, UaByteString, UaByteStrings, UaDateTime,
  UaDateTimes, UaDoubles, UaFloats, UaGuid, UaGuids, UaInt16s, UaInt32s, UaInt64s,
  UaNodeId, UaStrings, UaSBytes, UaUInt16s, UaUInt32s, UaUInt64s
*/

// Convert an array to a printable string. conjunction is typically "and" or "or".
function ArrayToFormattedString( array, conjunction )
{
    var str = array.toString().replace( /\,/g, ", " );
    str = str.replace( /(.*)\,/, "$1, " + conjunction );
    return str;
}

// Find a value within a specified array. Return TRUE if found, otherwise FALSE.
function ArrayContains( arrayToSearch, valueToFind )
{
    if( arrayToSearch.length !== undefined )
    {
        for( var i=0; i<arrayToSearch.length; i++ )
        {
            if( valueToFind === arrayToSearch[i] )
            {
                return( true );
            }
        }
    }
    return( false );
}

// Does the array contain the NodeId?
function IsNodeIdInArray( nodeIds, nodeId )
{
    for( var n = 0; n < nodeIds.length; n++ )
    {
        if( nodeIds[n].equals( nodeId ) )
        {
            return true;
        }
    }
    return false;
}


// Add the nodeId to an array (if the array does not already contain it)
function AddUniqueNodeIdToArray( nodeIds, nodeId )
{
    var found = IsNodeIdInArray( nodeIds, nodeId );
    if( !found )
    {
        nodeIds.push( nodeId );
    }
}


// From a NodeId setting, create the NodeId and add it to the array
// only if the NodeId is not null and not already in the array.
function AddNodeIdSettingToUniqueArray( nodeIds, nodeIdSetting, maxLength )
{
    var settingValue = readSetting( nodeIdSetting );
    if( settingValue !== undefined && settingValue !== null && settingValue.toString() !== "undefined" )
    {
        var nodeId = UaNodeId.fromString( settingValue.toString() );
        if( nodeId === null )
        {
            return;
        }
        if( nodeIds.length < maxLength )
        {
            AddUniqueNodeIdToArray( nodeIds, nodeId );
        }
    }
}


// Create an array of unique NodeIds by looking up every NodeId setting.
// The array will not exceed maxLength.
function GetMultipleUniqueNodeIds( maxLength )
{
    var nodeIds = [];
    
    if( nodeIds.length !== maxLength )
    {
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/Float", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/Double", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/String", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/SByte", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Scalar/XmlElement", maxLength );
    }
    if( nodeIds.length !== maxLength )
    {
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/Bool", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/DateTime", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/Float", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/Double", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/Guid", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/Int16", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/Int32", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/Int64", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/String", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/ByteString", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt16", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt32", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt64", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Static/All Profiles/Arrays/XmlElement", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/References/Has 3 Forward References 1", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/References/Has 3 Forward References 2", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/References/Has 3 Forward References 3", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/References/Has 3 Forward References 4", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/References/Has 3 Forward References 5", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/References/Has Inverse And Forward References", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/References/Has References With Different Parent Types", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/References/Has 3 Inverse References 1", maxLength );
        AddNodeIdSettingToUniqueArray( nodeIds, "/Server Test/NodeIds/Paths/Starting Node 1", maxLength );
    }

    return nodeIds;
}


/* Parameters include;
    monitoredItems:      monitoredItem objects (base/Objects)
    valuesToGenerate:    how many values to generate within the array
    offset:              a starting number used to generate each value 
    setValue:            enumeration defining a specific set of values to initialize with
//*/
function SetArrayWriteValuesInMonitoredItems( monitoredItems, valuesToGenerate, offset, setValue )
{
    if( offset === undefined )
    {
        offset = new Date().getSeconds(); // use this to get current Second, use it to generate different values
    }
    var arrayWriteValues;
    var i;
    var temp;

    print( "\n\n\nGenerating " + valuesToGenerate + " Array values (offset " + offset + ") ..." );
    for( var m=0; m<monitoredItems.length; m++ )
    {
        var dataType = monitoredItems[m].DataType;
        if( dataType === undefined || dataType === null )
        {
            dataType = NodeIdSettings.guessType( monitoredItems[m].NodeSetting );
        }
        switch( dataType )
        {
            case BuiltInType.Boolean:
                arrayWriteValues = new UaBooleans();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = false;
                    }
                    else
                    {
                        arrayWriteValues[i] = ( i + offset ) % 2;
                    }
                }
                monitoredItems[m].Value.Value.setBooleanArray( arrayWriteValues );
                break;

            case BuiltInType.Byte:
                arrayWriteValues = new UaBytes();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = 0;
                    }
                    else
                    {
                        arrayWriteValues[i] = i;
                    }
                }
                monitoredItems[m].Value.Value.setByteArray( arrayWriteValues );
                break;

            case BuiltInType.ByteString:
                if( monitoredItems[m].Value.Value.ArrayType == 0 )
                {
                    var strVal = "";
                    // we need to create a string whose length matches the requirement
                    for( i=0; i<valuesToGenerate; i++ )
                    {
                        if( setValue !== undefined && setValue !== null )
                        {
                            strVal += "";
                        }
                        else
                        {
                            strVal += "A";
                        }
                    }
                    arrayWriteValues = UaByteString.fromStringData( strVal );
                    monitoredItems[m].Value.Value.setByteString( arrayWriteValues );
                }
                else
                {
                    arrayWriteValues = new UaByteStrings();
                    for( i=0; i<valuesToGenerate; i++ )
                    {
                        var strVal = "";
                        // we need to create a string whose length matches the requirement
                        for( var n=0; n<valuesToGenerate; n++ )
                        {
                            if( setValue !== undefined && setValue !== null )
                            {
                                strVal += "";
                            }
                            else
                            {
                                strVal += String.fromCharCode( ( i + "A".charCodeAt( 0 ) ) );
                            }
                        }

                        arrayWriteValues[i] = UaByteString.fromStringData( strVal );
                    }
                    monitoredItems[m].Value.Value.setByteStringArray( arrayWriteValues );
                }
                break;

            case BuiltInType.DateTime:
                arrayWriteValues = new UaDateTimes();
                var now = UaDateTime.utcNow();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = new UaDateTime();
                    }
                    else
                    {
                        arrayWriteValues[i] = now.addSeconds( offset + i );
                    }
                }
                monitoredItems[m].Value.Value.setDateTimeArray( arrayWriteValues );
                break;

            case BuiltInType.Double:
                arrayWriteValues = new UaDoubles();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = 0;
                    }
                    else
                    {
                        arrayWriteValues[i] = offset * ( i + 1 ) * 2.1;
                    }
                }
                monitoredItems[m].Value.Value.setDoubleArray( arrayWriteValues );
                break;

            case BuiltInType.Float:
                arrayWriteValues = new UaFloats();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = 0.0;
                    }
                    else
                    {
                        arrayWriteValues[i] = 1.1 * ( i + 1 ) * offset;
                    }
                }
                monitoredItems[m].Value.Value.setFloatArray( arrayWriteValues );
                break;

            case BuiltInType.Guid:
                arrayWriteValues = new UaGuids();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = new UaGuid( "{00000000-0000-0000-0000-000000000}" );
                    }
                    else
                    {
                        temp = "{09C200B1-0CFB-479B-9F8E-3DEE6A01" + ( 40960 + offset + i ).toString(16) + "}";
                        arrayWriteValues[i] = new UaGuid( temp );
                    }
                }
                monitoredItems[m].Value.Value.setGuidArray( arrayWriteValues );
                break;

            case BuiltInType.Int16:
                arrayWriteValues = new UaInt16s();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = 0;
                    }
                    else
                    {
                        arrayWriteValues[i] = (offset + i) * 2;
                    }
                }
                monitoredItems[m].Value.Value.setInt16Array( arrayWriteValues );
                break;

            case BuiltInType.Int32:
                arrayWriteValues = new UaInt32s();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = 0;
                    }
                    else
                    {
                        arrayWriteValues[i] = ( offset + i ) * 10;
                    }
                }
                monitoredItems[m].Value.Value.setInt32Array( arrayWriteValues );
                break;

            case BuiltInType.Int64:
                arrayWriteValues = new UaInt64s();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = 0;
                    }
                    else
                    {
                        arrayWriteValues[i] = offset * ( i + 1 ) * 100;
                    }
                }
                monitoredItems[m].Value.Value.setInt64Array( arrayWriteValues );
                break;

            case BuiltInType.String:
                arrayWriteValues = new UaStrings();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = "";
                    }
                    else
                    {
                        arrayWriteValues[i] = "Hello World @" + ( offset + i );
                    }
                }
                monitoredItems[m].Value.Value.setStringArray( arrayWriteValues );
                break;

            case BuiltInType.SByte:
                arrayWriteValues = new UaSBytes();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = 0;
                    }
                    else
                    {
                        arrayWriteValues[i] = ( offset + i );
                    }
                }
                monitoredItems[m].Value.Value.setSByteArray( arrayWriteValues );
                break;

            case BuiltInType.UInt16:
                arrayWriteValues = new UaUInt16s();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = 0;
                    }
                    else
                    {
                        arrayWriteValues[i] = Math.abs( offset ) * ( i + 1 ) * 2;
                    }
                }
                monitoredItems[m].Value.Value.setUInt16Array( arrayWriteValues );
                break;

            case BuiltInType.UInt32:
                arrayWriteValues = new UaUInt32s();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = 0;
                    }
                    else
                    {
                        arrayWriteValues[i] = Math.abs( offset ) * ( i + 1 ) * 2;
                    }
                }
                monitoredItems[m].Value.Value.setUInt32Array( arrayWriteValues );
                break;

            case BuiltInType.UInt64:
                arrayWriteValues = new UaUInt64s();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = 0;
                    }
                    else
                    {
                        arrayWriteValues[i] = Math.abs( offset ) * ( i + 1 ) * 10;
                    }
                }
                monitoredItems[m].Value.Value.setUInt64Array( arrayWriteValues );
                break;

            case BuiltInType.XmlElement:
                arrayWriteValues = new UaXmlElements();
                for (i = 0; i < valuesToGenerate; i++)
                {
                    if( setValue !== undefined && setValue !== null )
                    {
                        arrayWriteValues[i] = "<a></a>";
                    }
                    else
                    {
                        arrayWriteValues[i] = new UaXmlElement();
                        arrayWriteValues[i].setString( "<uactt" + i + ">" + (offset + i) + "</uactt" + i + ">" );
                    }
                }
                monitoredItems[m].Value.Value.setXmlElementArray( arrayWriteValues );
                break; 

            default:
                break;
        }//switch
    }// for m...
}

/*
// TEST CODE
include( "./library/Base/Objects/monitoredItem.js" );
var mi = new MonitoredItem( new UaNodeId( Identifier.Server ), 0 );
mi.DataType = BuiltInType.Byte;
print( "before: " + mi.Value );
SetArrayWriteValuesInMonitoredItems( [mi], 5, 5 );
print( "after: " + mi.Value );*/