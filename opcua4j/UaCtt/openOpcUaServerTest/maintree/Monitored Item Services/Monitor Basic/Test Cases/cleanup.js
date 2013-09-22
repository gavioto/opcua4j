print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Basic' TEST SCRIPTS COMPLETE ******\n" );

// delete global subscription
publishService.Clear();
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
deleteSubscription( MonitorBasicSubscription, g_session );

// disconnect from server
include( "./library/Base/disconnect.js" );
disconnect( g_channel, g_session );

// clean-up
ModifyMIsHelper = null;
ReadHelper = null;
WriteHelper = null;
setMonitoringService = null;
publishService = null;
MonitorBasicSubscription = null;
g_session = null;
g_channel = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Basic' TESTING COMPLETE ******\n" );