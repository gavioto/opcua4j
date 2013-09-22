print( "\n\n\n***** CONFORMANCE UNIT 'Data Access Analog' TEST SCRIPTS COMPLETE ******\n" );

// disconnect from server
PublishHelper.Clear();
disconnect( g_channel, g_session );

// clean-up
ReadHelper = null;
WriteHelper = null;
PublishHelper = null;
g_session = null;
g_channel = null;
AnalogItems = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Data Access Analog' TESTING COMPLETE ******\n" );