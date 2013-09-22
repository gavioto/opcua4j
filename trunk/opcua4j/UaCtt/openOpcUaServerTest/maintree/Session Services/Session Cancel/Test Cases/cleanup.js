print( "\n\n\n***** CONFORMANCE UNIT 'Session Cancel' TEST SCRIPTS COMPLETE ******\n" );

include("./library/Base/disconnect.js")

// disconnect from server
disconnect( g_channel, g_session );

// clean-up
g_session = null;
g_channel = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Session Cancel' TESTING COMPLETE ******\n" );