/*global addError, connect, include, stopCurrentUnit,
  UaChannel, UaSession
*/

include( "./library/Base/connect.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/check_translateBrowsePathsToNodeIds_valid.js");
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/check_translateBrowsePathsToNodeIds_error.js");
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/check_translateBrowsePathsToNodeIds_failed.js");
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/create_request.js" );
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/translateBrowsePathsToNodeIdsHelper.js" );
include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_translateBrowsePathsToNodeIds_basic.js" );

include( "./library/ClassBased/UaQualifiedName/create_qualified_name.js" );
include( "./library/ClassBased/UaNodeId/create_nodeid.js" );
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