include( "./library/Base/connect.js" );
include( "./library/Base/disconnect.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Information/_Base/NodeIsOfCompliantType.js" );
include( "./library/Information/_Base/InformationModelObjectHelper.js" );

// Connect to the server 
// Connect to the server 
var g_channel = new UaChannel();
var g_session = new UaSession( g_channel );
g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
if( !connect( g_channel, g_session ) )
{
    addError( "Connect()");
    stopCurrentUnit();
}

print( "\n\n\n***** CONFORMANCE UNIT 'Address Space Base' TESTING BEGINS ******\n" );