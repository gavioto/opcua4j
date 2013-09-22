print( "\n\n\n***** CONFORMANCE UNIT 'Monitor MinQueueSize 02' TEST SCRIPTS COMPLETE ******\n" );

// delete global subscription
deleteSubscription( MonitorQueueSize2Subscription, g_session );

// disconnect from server
include( "./library/Base/disconnect.js" );

// disconnect from server
disconnect( g_channel, g_session );

// clean-up
SetMonitoringModeHelper = null;
PublishHelper = null;
WriteHelper = null;
MonitorQueueSize2Subscription = null;
g_session = null;
g_channel = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Monitor MinQueueSize 02' TESTING COMPLETE ******\n" );