print( "\n\n\n***** CONFORMANCE UNIT 'Attribute Write Values' TEST SCRIPTS COMPLETE ******\n" );

include( "./library/Base/disconnect.js" );

// disconnect from server
disconnect( g_channel, g_session );

// clean-up
originalArrayScalarValues = null;
READ = null;
writeService = null;
g_session = null;
g_channel = null;
OPTIONAL_CONFORMANCEUNIT = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Attribute Write Values' TESTING COMPLETE ******\n" );