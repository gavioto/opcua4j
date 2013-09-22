print( "\n\n\n***** CONFORMANCE UNIT 'Attribute Write Index' TEST SCRIPTS COMPLETE ******\n" );

include( "./library/Base/disconnect.js" );

// disconnect from server
disconnect( g_channel, g_session );

// clean-up
originalArrayScalarValues = null;
READ = null;
WRITE = null;
items = null;
g_session = null;
g_channel = null;
WRITEVERIFICATION_OFF = null;
OPTIONAL_CONFORMANCEUNIT = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Attribute Write Index' TESTING COMPLETE ******\n" );