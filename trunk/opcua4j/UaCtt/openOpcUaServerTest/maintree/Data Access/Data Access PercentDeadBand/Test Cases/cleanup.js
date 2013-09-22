print( "\n\n\n***** CONFORMANCE UNIT 'Data Access PercentDeadband' TEST SCRIPTS COMPLETE ******\n" );

// delete global subscription
include("./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js")
deleteSubscription( MonitorBasicSubscription, g_session );

// disconnect from server
include("./library/Base/disconnect.js")

// disconnect from server
disconnect( g_channel, g_session );

// clean-up
ModifyMIsHelper = null;
WriteHelper = null;
ReadHelper = null;
PublishHelper = null;
MonitorBasicSubscription = null;
g_session = null;
g_channel = null;
OVERFLOWBIT = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Data Access PercentDeadband' TESTING COMPLETE ******\n" );