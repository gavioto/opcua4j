print( "\n\n\n***** CONFORMANCE UNIT 'Monitor QueueSize 01' TEST SCRIPTS COMPLETE ******\n" );

// delete global subscription
deleteSubscription( MonitorQueueSize1Subscription, g_session );

// disconnect from server
include( "./library/Base/disconnect.js" );

// disconnect from server
disconnect( g_channel, g_session );

// clean-up
MonitorQueueSize1Subscription = null;
g_session = null;
g_channel = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Monitor QueueSize 01' TESTING COMPLETE ******\n" );