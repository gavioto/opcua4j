/*  Test 5.8.1 Test 24; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read a single attribute from a valid node where the type is 
        an array data type.

    Revision History
        21-Sep-2009 NP: Initial version.
        10-Nov-2009 NP: REVIEWED.
        16-Jun-2010 NP: Script exits with NotSupported if no arrays are configured.
        13-Jul-2010 DP: Removed array prepopulation code; was problematic for some servers.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function readArray581024( nodeToRead )
{
    const MIN_ARRAY_BOUNDS_SIZE = 2;
    const MAXSTRINGSIZE = 100;
    if( nodeToRead === null )
    {
        return;
    }

    //var monitoredItem = new MonitoredItem( nodeToRead, 0, Attribute.Value );
    print( "Reading ARRAY node: '" + nodeToRead.NodeId + "' (setting: '" + nodeToRead.NodeSetting + "')" );
    if( ReadHelper.Execute( [nodeToRead], TimestampsToReturn.Both ) )
    {
        // display the values
        print( ReadHelper.ValuesToString( MAXSTRINGSIZE ) );

        // check the data type
        var valueAsArray;
        switch( NodeIdSettings.guessType( nodeToRead.NodeSetting ) )
        {
            case BuiltInType.Boolean:
                valueAsArray = nodeToRead.Value.Value.toBooleanArray();
                break;
            case BuiltInType.Byte:
                valueAsArray = nodeToRead.Value.Value.toByteArray();
                break;
            case BuiltInType.ByteString:
                valueAsArray = nodeToRead.Value.Value.toByteStringArray();
                break;
            case BuiltInType.DateTime:
                valueAsArray = nodeToRead.Value.Value.toDateTimeArray();
                break;
            case BuiltInType.Double:
                valueAsArray = nodeToRead.Value.Value.toDoubleArray();
                break;
            case BuiltInType.Float:
                valueAsArray = nodeToRead.Value.Value.toFloatArray();
                break;
            case BuiltInType.Guid:
                valueAsArray = nodeToRead.Value.Value.toGuidArray();
                break;
            case BuiltInType.Int16:
                valueAsArray = nodeToRead.Value.Value.toInt16Array();
                break;
            case BuiltInType.Int32:
                valueAsArray = nodeToRead.Value.Value.toInt32Array();
                break;
            case BuiltInType.Int64:
                valueAsArray = nodeToRead.Value.Value.toInt64Array();
                break;
            case BuiltInType.SByte:
                valueAsArray = nodeToRead.Value.Value.toSByteArray();
                break;
            case BuiltInType.String:
                valueAsArray = nodeToRead.Value.Value.toStringArray();
                break;
            case BuiltInType.UInt16:
                valueAsArray = nodeToRead.Value.Value.toUInt16Array();
                break;
            case BuiltInType.UInt32:
                valueAsArray = nodeToRead.Value.Value.toUInt32Array();
                break;
            case BuiltInType.UInt64:
                valueAsArray = nodeToRead.Value.Value.toUInt64Array();
                break;
            case BuiltInType.XmlElement:
                valueAsArray = nodeToRead.Value.Value.toXmlElementArray();
                break;
            default:
                addError( "Built in type not specified: " + nodeType );
        }

        // check that the value is an array
        // check if the type is a byte, because the validation is slightly different
        AssertGreaterThan( MIN_ARRAY_BOUNDS_SIZE, nodeToRead.Value.Value.getArraySize(), "We expected to receive an array type, with bounds > " + MIN_ARRAY_BOUNDS_SIZE );
    }
}

function read581024()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0 );
    if( items === null || items.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }
    for( var i=0; i<items.length; i++ )
    {
        readArray581024( items[i] );
    }
}

safelyInvoke( read581024 );