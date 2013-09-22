include( "./library/Base/connect.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/array.js" );
include( "./library/Base/safeInvoke.js" );
// include all library scripts specific to browse tests
include( "./library/ServiceBased/ViewServiceSet/Browse/get_default_request.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/get_references.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/assert_browse_error.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/assert_browse_valid.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/check_browse_failed.js" );
include( "./library/ServiceBased/ViewServiceSet/BrowseNext/assert_browsenext_valid.js" );
include( "./library/ServiceBased/ViewServiceSet/BrowseNext/release_continuationpoints_test.js" );
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