print( "\n\n\n***** CONFORMANCE UNIT 'Session General Session Behavior' TEST SCRIPTS COMPLETE ******\n" );

include( "./library/Base/disconnectChannel.js" );

disconnectChannel( g_channel );

// clean-up
g_session = null;
g_pkiProvider = null;
g_channel = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Session General Service Behavior' TESTING COMPLETE ******\n" );