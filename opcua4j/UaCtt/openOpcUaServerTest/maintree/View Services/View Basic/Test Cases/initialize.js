/*global include, UaChannel, UaSession, connect, 
  addError, stopCurrentUnit
*/

include( "./library/Base/connect.js" );
include( "./library/Base/check_timestamp.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/array.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
// include all library scripts specific to browse tests
include( "./library/ServiceBased/ViewServiceSet/Browse/get_default_request.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/get_references.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/assert_browse_error.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/assert_browse_valid.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/check_browse_failed.js" );
include( "./library/ServiceBased/ViewServiceSet/BrowseNext/check_browseNext_failed.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/Browse.js" );

// Connect to the server 
var Channel = new UaChannel();
var Session = new UaSession( Channel );
Session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );

if( !connect( Channel, Session ) )
{
    addError( "Connect failed. Stopping execution of current conformance unit." );
    stopCurrentUnit();
}

// create our HELPER objects
var BrowseHelper = new Browse( Session );

// cache the NodeId settings for the NodeClass tests
var nodeClassItems = MonitoredItem.fromSettings( NodeIdSettings.NodeClasses() );
// do we have enough nodes for testing?
if( 0 === nodeClassItems.length )
{
    addWarning( "Will not be able to complete all tests. Zero nodes configured for nodeClass testing." );
}
else if( nodeClassItems.length !== NodeIdSettings.NodeClasses().length )
{
    addWarning( "Some NodeClasses wil not be tested because they are not configured." );
}

// the "nodeClasses" and "nodesToBrowse" variables will be used by the script library objects
var nodeClasses = [];
var nodesToBrowse = [];
for( var i=0; i<nodeClassItems.length; i++ )
{
    nodesToBrowse.push( nodeClassItems[i].NodeId );
    switch( nodeClassItems[i].NodeSetting )
    {
        case "/Server Test/NodeIds/NodeClasses/HasObject":   nodeClasses.push( NodeClass.Object );
        case "/Server Test/NodeIds/NodeClasses/HasVariable": nodeClasses.push( NodeClass.Variable );
        case "/Server Test/NodeIds/NodeClasses/HasMethod":   nodeClasses.push( NodeClass.Method );
        case "/Server Test/NodeIds/NodeClasses/HasObjectType":    nodeClasses.push( NodeClass.ObjectType );
        case "/Server Test/NodeIds/NodeClasses/HasVariableType":  nodeClasses.push( NodeClass.VariableType );
        case "/Server Test/NodeIds/NodeClasses/HasReferenceType": nodeClasses.push( NodeClass.ReferenceType );
        case "/Server Test/NodeIds/NodeClasses/HasDataType":      nodeClasses.push( NodeClass.DataType );
    }
}