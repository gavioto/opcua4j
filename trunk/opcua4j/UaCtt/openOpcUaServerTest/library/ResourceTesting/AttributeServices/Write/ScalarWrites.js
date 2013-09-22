/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Writes a new value to the Value attribute of all configured Scalar Nodes.

    Settings used:
        /Server Test/NodeIds/Static/All Profiles/Scalar

    Revision History
        04-Jan-2010 NP: Initial version.
*/

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/Base/UaVariantToSimpleType.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );

// this is the function that will be called repetitvely
function write()
{
    var currSec = timeAtStart.msecsTo( UaDateTime.utcNow() );
    // change the values of each node
    for( n=0; n<originalScalarItems.length; n++ )
    {
        GenerateScalarValue( originalScalarItems[n].Value.Value, originalScalarItems[n].Value.Value.DataType, currSec );
    }
    // invoke the write
    if( !WriteHelper.Execute( originalScalarItems, undefined, undefined, undefined, undefined, true ) )
    {
        addError( "Could not read the initial values of the Scalar nodes we want to test." );
    }
}

function initialize()
{
    var ReadHelper = new Read( g_session );
    if( !ReadHelper.Execute( originalScalarItems, undefined, undefined, undefined, undefined, true ) )
    {
        throw( "Could not read the initial values of the Scalar nodes we want to test." );
    }
    ReadHelper = null;
    WriteHelper = new Write( g_session );
}

// Get a list of items to read from settings
var originalScalarItems = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
if( originalScalarItems === null || originalScalarItems.length === 0 ){ return; }

// Create a WRITE service call helper and invoke the Read
var WriteHelper;

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/AttributeServicesCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( initialize, write, loopCount, undefined, undefined, undefined, "Scalar Writes" );

// clean-up
originalScalarItems = null;
ReadHelper = null;