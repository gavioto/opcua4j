/*global include, UaChannel, UaSession, connect, addError, 
  stopCurrentUnit
*/
include( "./library/Base/connect.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );

include( "./library/ServiceBased/ViewServiceSet/RegisterNodes/assert_registernodes_valid.js" );
include( "./library/ServiceBased/ViewServiceSet/RegisterNodes/check_registerNodes_valid.js" );
include( "./library/ServiceBased/ViewServiceSet/RegisterNodes/check_registerNodes_failed.js" );
include( "./library/ServiceBased/ViewServiceSet/RegisterNodes/register_nodes_test.js" );

include( "./library/ServiceBased/ViewServiceSet/UnregisterNodes/check_unregisterNodes_valid.js" );
include( "./library/ServiceBased/ViewServiceSet/UnregisterNodes/check_unregisterNodes_failed.js" );
include( "./library/ServiceBased/ViewServiceSet/UnregisterNodes/unregister_nodes_test.js" );

include( "./library/ClassBased/UaRegisterNodesRequest/create_default_request.js" );
include( "./library/ClassBased/UaUnregisterNodesRequest/create_default_request.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );

// Connect to the server 
var Channel = new UaChannel();
var Session = new UaSession( Channel );
Session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );

if( !connect( Channel, Session ) )
{
    addError( "Connect failed. Stopping execution of current conformance unit." );
    stopCurrentUnit();
}