print( "\n\n\n***** CONFORMANCE UNIT 'Subscription Minimum 02' TEST SCRIPTS COMPLETE ******\n" );

// close sessions
closeSession( g_session );

// disconnect channel
disconnectChannel( g_channel );

// clean-up
writeService = null;
g_session = null;
g_channel = null;
monitoredItem = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Subscription Minimum 02' TESTING COMPLETE ******\n" );