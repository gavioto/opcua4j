print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Events' TEST SCRIPTS COMPLETE ******\n" );

// delete global subscription
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
if( MonitorEventsSubscription !== undefined && MonitorEventsSubscription !== null )
{
    deleteSubscription( MonitorEventsSubscription, g_session );
}

// disconnect from server
include( "./library/Base/disconnect.js" );

// disconnect from server
disconnect( g_channel, g_session );

// clean-up
PublishHelper = null;
MonitorEventsSubscription = null;
g_session = null;
g_channel = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Events' TESTING COMPLETE ******\n" );