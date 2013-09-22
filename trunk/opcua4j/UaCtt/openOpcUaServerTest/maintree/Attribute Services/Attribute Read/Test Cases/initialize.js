/*    Revision History: 
        May-18-2011 NP: Remove WriteHelper reference.
*/

include( "./library/Base/connect.js" );
include( "./library/Base/disconnect.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/array.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/integerSet.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/NodeTypeAttributesMatrix.js" );
include( "./library/Base/UaVariantToSimpleType.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
include( "./library/Base/indexRangeRelatedUtilities.js" );
// Read
include( "./library/ServiceBased/AttributeServiceSet/Read/readAndCheckServerState.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/read_test.js" );
// Write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/check_write_valid.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
// Browse library scripts
include( "library/ServiceBased/ViewServiceSet/Browse/get_references.js" );

// some constant definitions to help with the scripts
var ATTRIBUTE_READ_INVALIDATTRIBUTEID = 999;

// Connect to the server 
var g_channel = new UaChannel();
var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
if( !connect( g_channel, g_session ) )
{
    addError( "Connect()");
    stopCurrentUnit();
}

var originalScalarItems = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic().concat( NodeIdSettings.ArraysStatic() ) );
if( originalScalarItems === null || originalScalarItems.length === 0 )
{
    _dataTypeUnavailable.store( "Scalar Static" );
    stopCurrentUnit();
}

var ReadHelper = new Read( g_session );
if( !ReadHelper.Execute( originalScalarItems ) )
{
    addError( "Could not read the initial values of the Scalar nodes we want to test." );
//    stopCurrentUnit();
}
else
{
    // store the original values
    for( var i=0; i<originalScalarItems.length; i++ )
    {
        originalScalarItems[i].OriginalValue = originalScalarItems[i].Value.Value.clone();
    }
}

print( "\n\n\n***** CONFORMANCE UNIT 'Attribute Read' TEST SCRIPTS STARTING ******\n" );

//print( "***** Initializing the values of all Scalar nodes *****" );
//var writeHelper = new Write( g_session );

function revertOriginalValuesScalarStatic()
{
    if( originalScalarItems === undefined || originalScalarItems === null || originalScalarItems.length === 0 )
    {
        return;
    }
    // restore the original values
    addLog( "Reverting Scalar Static nodes to their original values." );
    var expectedResults = [];
    var doWrite = false;
    for( var i=0; i<originalScalarItems.length; i++ )
    {
        if( originalScalarItems[i].OriginalValue !== undefined )
        {
            originalScalarItems[i].Value.Value = originalScalarItems[i].OriginalValue.clone();
            doWrite = true;
        }
        expectedResults[i] = new ExpectedAndAcceptedResults( StatusCode.Good );
        expectedResults[i].addAcceptedResult( StatusCode.BadNotWritable )
    }
    if( doWrite ){ writeHelper.Execute( originalScalarItems, expectedResults, true, true, false ); }
}