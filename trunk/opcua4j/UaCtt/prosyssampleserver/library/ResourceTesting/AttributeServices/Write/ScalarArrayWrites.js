/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Writes a new value to the Value attribute of all configured Static Scalar Nodes of type Array.
        You can specify if the WRITE call should be verified by READING the values back and
        comparing them to values previously written. See constant below: DO_READ_AFTER_WRITE_VALIDATION

    Settings used:
        /Server Test/NodeIds/Static/All Profiles/Arrays

    Revision History
        04-Jan-2010 NP: Initial version.
*/

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/Base/UaVariantToSimpleType.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );

const DO_READ_AFTER_WRITE_VALIDATION = false;
const SUPPRESS_MESSAGING = true;

// function creates the values for writing to an array
function SetArrayWriteValuesInMonitoredItems( monitoredItems, offset )
{
    if( offset === undefined )
    {
        offset = new Date().getSeconds(); // use this to get current Second, use it to generate different values
    }
    var arrayWriteValues;
    var i;
    var temp;
    var valuesToGenerate;

    print( "\n\n\nGenerating " + valuesToGenerate + " Array values (offset " + offset + ") ..." );
    for( var m=0; m<monitoredItems.length; m++ )
    {
        var dataType = monitoredItems[m].DataType;
        if( dataType === undefined || dataType === null )
        {
            dataType = NodeIdSettings.guessType( monitoredItems[m].NodeSetting );
        }
        // calculate the number of values to generate, based on the current size
        // of the array
        valuesToGenerate = monitoredItems[m].Value.Value.getArraySize();
        switch( dataType )
        {
            case BuiltInType.Boolean:
                arrayWriteValues = new UaBooleans();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    arrayWriteValues[i] = ( i + offset ) % 2;
                }
                monitoredItems[m].Value.Value.setBooleanArray( arrayWriteValues );
                break;

            case BuiltInType.Byte:
                arrayWriteValues = new UaBytes();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    arrayWriteValues[i] = i;
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
                        strVal += "A";
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
                            strVal += String.fromCharCode( ( i + "A".charCodeAt( 0 ) ) );
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
                    arrayWriteValues[i] = now.addSeconds( offset + i );
                }
                monitoredItems[m].Value.Value.setDateTimeArray( arrayWriteValues );
                break;

            case BuiltInType.Double:
                arrayWriteValues = new UaDoubles();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    arrayWriteValues[i] = offset * ( i + 1 ) * 2.1;
                }
                monitoredItems[m].Value.Value.setDoubleArray( arrayWriteValues );
                break;

            case BuiltInType.Float:
                arrayWriteValues = new UaFloats();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    arrayWriteValues[i] = 1.1 * ( i + 1 ) * offset;
                }
                monitoredItems[m].Value.Value.setFloatArray( arrayWriteValues );
                break;

            case BuiltInType.Guid:
                arrayWriteValues = new UaGuids();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    temp = "{09C200B1-0CFB-479B-9F8E-3DEE6A01" + ( 40960 + offset + i ).toString(16) + "}";
                    arrayWriteValues[i] = new UaGuid( temp );
                }
                monitoredItems[m].Value.Value.setGuidArray( arrayWriteValues );
                break;

            case BuiltInType.Int16:
                arrayWriteValues = new UaInt16s();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    arrayWriteValues[i] = (offset + i) * 2;
                }
                monitoredItems[m].Value.Value.setInt16Array( arrayWriteValues );
                break;

            case BuiltInType.Int32:
                arrayWriteValues = new UaInt32s();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    arrayWriteValues[i] = ( offset + i ) * 10;
                }
                monitoredItems[m].Value.Value.setInt32Array( arrayWriteValues );
                break;

            case BuiltInType.Int64:
                arrayWriteValues = new UaInt64s();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    arrayWriteValues[i] = offset * ( i + 1 ) * 100;
                }
                monitoredItems[m].Value.Value.setInt64Array( arrayWriteValues );
                break;

            case BuiltInType.String:
                arrayWriteValues = new UaStrings();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    arrayWriteValues[i] = "Hello World @" + ( offset + i );
                }
                monitoredItems[m].Value.Value.setStringArray( arrayWriteValues );
                break;

            case BuiltInType.SByte:
                arrayWriteValues = new UaSBytes();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    arrayWriteValues[i] = ( offset + i );
                }
                monitoredItems[m].Value.Value.setSByteArray( arrayWriteValues );
                break;

            case BuiltInType.UInt16:
                arrayWriteValues = new UaUInt16s();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    arrayWriteValues[i] = Math.abs( offset ) * ( i + 1 ) * 2;
                }
                monitoredItems[m].Value.Value.setUInt16Array( arrayWriteValues );
                break;

            case BuiltInType.UInt32:
                arrayWriteValues = new UaUInt32s();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    arrayWriteValues[i] = Math.abs( offset ) * ( i + 1 ) * 2;
                }
                monitoredItems[m].Value.Value.setUInt32Array( arrayWriteValues );
                break;

            case BuiltInType.UInt64:
                arrayWriteValues = new UaUInt64s();
                for( i=0; i<valuesToGenerate; i++ )
                {
                    arrayWriteValues[i] = Math.abs( offset ) * ( i + 1 ) * 10;
                }
                monitoredItems[m].Value.Value.setUInt64Array( arrayWriteValues );
                break;

            case BuiltInType.XmlElement:
                arrayWriteValues = new UaXmlElements();
                for (i = 0; i < valuesToGenerate; i++)
                {
                    arrayWriteValues[i] = new UaXmlElement();
                    arrayWriteValues[i].setString( "<uactt" + i + ">" + (offset + i) + "</uactt" + i + ">" );
                }
                monitoredItems[m].Value.Value.setXmlElementArray( arrayWriteValues );
                break; 

            default:
                break;
        }//switch
    }// for m...
}

// this is the function that will be called repetitvely
function write()
{
    var currSec = timeAtStart.msecsTo( UaDateTime.utcNow() );
    // change the values of each node
    SetArrayWriteValuesInMonitoredItems( originalScalarItems, currSec );
    // invoke the write
    if( !WriteHelper.Execute( originalScalarItems, undefined, undefined, undefined, DO_READ_AFTER_WRITE_VALIDATION, SUPPRESS_MESSAGING ) )
    {
        addError( "Could not read the initial values of the Scalar nodes we want to test." );
    }
}

function initialize()
{
    var ReadHelper = new Read( g_session );
    if( !ReadHelper.Execute( originalScalarItems, undefined, undefined, undefined, undefined, SUPPRESS_MESSAGING ) )
    {
        throw( "Could not read the initial values of the Scalar nodes we want to test." );
    }
    ReadHelper = null;
    WriteHelper = new Write( g_session );
}

// Get a list of items to read from settings
var originalScalarItems = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic() );
if( originalScalarItems === null || originalScalarItems.length === 0 ){ return; }

// Create a WRITE service call helper and invoke the Read
var WriteHelper;

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/AttributeServicesCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( initialize, write, loopCount, undefined, undefined, undefined, "Scalar Writes, Arrays" );

// clean-up
originalScalarItems = null;
ReadHelper = null;