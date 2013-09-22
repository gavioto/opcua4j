print( "\n\n\n***** CONFORMANCE UNIT 'Subscription Publish Min 10' TEST SCRIPTS COMPLETE ******\n" );

// close sessions
closeSession( g_session );

// disconnect channel
disconnectChannel( g_channel );

// clean-up
writeService = null;
g_session = null;
g_channel = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Subscription Publish Min 10' TESTING COMPLETE ******\n" );