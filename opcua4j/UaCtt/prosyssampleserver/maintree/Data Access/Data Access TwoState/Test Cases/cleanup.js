print( "\n\n\n***** CONFORMANCE UNIT 'Data Access TwoState' TEST SCRIPTS COMPLETE ******\n" );

// disconnect from server
PublishHelper.Clear();
disconnect( g_channel, g_session );

// clean-up
PublishHelper = null;
WriteHelper = null;
ReadHelper = null;
g_session = null;
g_channel = null;
multiStateItems = null;
twoStateItems = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Data Access TwoState' TESTING COMPLETE ******\n" );