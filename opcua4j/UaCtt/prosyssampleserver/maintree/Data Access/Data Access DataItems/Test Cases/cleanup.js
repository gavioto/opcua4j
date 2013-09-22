print( "\n\n\n***** CONFORMANCE UNIT 'Data Access DataItems' TEST SCRIPTS COMPLETE ******\n" );

// disconnect from server
PublishHelper.Clear();
disconnect( g_channel, g_session );
// clean-up
ReadHelper = null;
WriteHelper = null;
PublishHelper = null;
g_session = null;
g_channel = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Data Access DataItems' TESTING COMPLETE ******\n" );