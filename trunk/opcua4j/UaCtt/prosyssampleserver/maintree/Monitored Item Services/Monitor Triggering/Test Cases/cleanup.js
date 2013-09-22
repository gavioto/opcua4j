print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Triggering' TEST SCRIPTS COMPLETE ******\n" );

// delete global subscription
PublishHelper.Clear();
include("./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js")
deleteSubscription( MonitorTriggeringSubscription, g_session );

// disconnect from server
include("./library/Base/disconnect.js");

// disconnect from server
disconnect( g_channel, g_session );

// clean-up
SetTriggeringHelper = null;
ReadHelper = null;
WriteHelper = null;
PublishHelper = null;
MonitorTriggeringSubscription = null;
g_session = null;
g_channel = null;
SAMPLING_RATE_FASTEST = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Triggering' TESTING COMPLETE ******\n" );