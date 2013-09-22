print( CU_NAME + " COMPLETE ******\n" );

// clean-up
// disconnect from server
disconnect( g_channel, g_session );

// clean-up
g_session = null;
g_channel = null;

print( CU_NAME + " COMPLETE ******\n" );