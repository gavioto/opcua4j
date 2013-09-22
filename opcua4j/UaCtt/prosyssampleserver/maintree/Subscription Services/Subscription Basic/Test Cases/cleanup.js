print( "\n\n\n***** CONFORMANCE UNIT 'Subscription Basic' TEST SCRIPTS COMPLETE ******\n" );

// disconnect from server
if( publishService !== undefined && publishService !== null )
{
    publishService.Clear();
}
disconnect( g_channel, g_session );

// clean up
defaultStaticItem = null;
fastestPublishingIntervalSupported = null;
g_channel = null;
g_session = null;
readService = null;
writeService = null;
publishService = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Subscription Basic' TESTING COMPLETE ******\n" );