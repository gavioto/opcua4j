/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read value attribute of all configured Scalar Nodes.

    Settings used:
        /Server Test/NodeIds/Static/All Profiles/Scalar

    Revision History
        04-Jan-2010 NP: Initial version.
*/

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );

// this is the function that will be called repetitvely
function read()
{
    if( !ReadHelper.Execute( originalScalarItems, undefined, undefined, undefined, undefined, true ) )
    {
        addError( "Could not read the initial values of the Scalar nodes we want to test." );
    }
}

function initialize()
{
    ReadHelper = new Read( g_session );
}

// Get a list of items to read from settings
var originalScalarItems = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
if( originalScalarItems === null || originalScalarItems.length === 0 ){ return; }

// Create a READ service call helper and invoke the Read
var ReadHelper;

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/AttributeServicesCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( initialize, read, loopCount, undefined, undefined, undefined, "Scalar Reads" );

// clean-up
originalScalarItems = null;
ReadHelper = null;