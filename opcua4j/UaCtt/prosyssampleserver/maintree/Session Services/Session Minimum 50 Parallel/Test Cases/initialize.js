include( "./library/Base/connectChannel.js" );
include( "./library/Base/check_timestamp.js" );

var g_channel = new UaChannel();

if( !connectChannel( g_channel, readSetting( "/Server Test/Server URL" ) ) )
{
    addError( "connectChannel failed. Stopping execution of current conformance unit." );
    stopCurrentUnit();
}

// the max Count of sessions
var g_sessionCount = 50;

// Connect to the server 
var g_sessions = [];

for( var i = 0; i < g_sessionCount; i++ )
{
    g_sessions[i] = new UaSession( g_channel );
    g_sessions[i].DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
}