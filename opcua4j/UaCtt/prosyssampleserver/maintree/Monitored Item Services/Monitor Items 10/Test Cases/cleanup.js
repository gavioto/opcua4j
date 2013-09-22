print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Items 10' TEST SCRIPTS COMPLETE ******\n" );

// disconnect from server
include( "./library/Base/disconnect.js" );
disconnect( g_channel, g_session );

// clean-up
print( "\n\n\n\n\nwaiting 1 sec" );
wait( 1000 );
MonitorBasicSubscription = null;
g_session = null;
g_channel = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Items 10' TESTING COMPLETE ******\n" );