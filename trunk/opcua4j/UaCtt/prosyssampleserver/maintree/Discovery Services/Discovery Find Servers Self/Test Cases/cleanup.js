print( "\n\n\n***** CONFORMANCE UNIT 'Discovery Find Servers Self' TEST SCRIPTS COMPLETE ******\n" );

include( "./library/Base/disconnectChannel.js" )

// disconnect from server
disconnectChannel( f_channel );

// clean-up
g_discovery = null;
f_channel = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Discovery Find Servers Self' TESTING COMPLETE ******\n" );