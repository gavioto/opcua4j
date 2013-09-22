print( "\n***** CONFORMANCE UNIT 'Discovery Get Endpoints' TEST SCRIPTS COMPLETE ******\n" );

include( "./library/Base/disconnectChannel.js" )

// disconnect from server
disconnectChannel( f_channel );

// clean-up
g_pkiProvider = null;
g_discovery = null;
f_channel = null;

print( "\n***** CONFORMANCE UNIT 'Discovery Get Endpoints' TESTING COMPLETE ******\n" );