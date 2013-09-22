print( "\n\n\n***** CONFORMANCE UNIT 'Subscription Publish Min 05' TEST SCRIPTS COMPLETE ******\n" );

// close sessions
disconnect( g_channel, g_session );

// clean up
publishService = null;
readService  = null;
writeService = null;
g_session = null;
g_channel = null;
SUBSCRIPTION_PUBLISH_MIN_05_SESSIONCREATECOUNT = null;
SUBSCRIPTION_PUBLISH_MIN_05_PUBLISHCALLCOUNT   = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Subscription Publish Min 05' TESTING COMPLETE ******\n" );