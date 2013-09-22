include( "./library/Base/connect.js" );
include( "./library/Base/disconnect.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Information/_Base/NodeIsOfCompliantType.js" );
include( "./library/Information/_Base/InformationModelObjectHelper.js" );

const CU_NAME = "\n\n\n***** CONFORMANCE UNIT 'Base Info Core Structure' TESTING ";

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

print( CU_NAME + " BEGINS ******\n" );