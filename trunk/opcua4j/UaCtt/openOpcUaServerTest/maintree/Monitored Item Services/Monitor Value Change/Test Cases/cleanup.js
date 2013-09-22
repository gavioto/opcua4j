print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Value Change' TEST SCRIPTS COMPLETE ******\n" );

// delete global subscription
PublishHelper.Clear();
deleteSubscription( MonitorBasicSubscription, g_session );

// put all nodes back to their original values
revertOriginalValuesScalarStatic();

// disconnect from server
include("./library/Base/disconnect.js")

// disconnect from server
disconnect( g_channel, g_session );

// clean-up
SetMonitoringModeHelper = null;
PublishHelper = null;
WriteHelper = null;
ReadHelper = null;
MonitorBasicSubscription = null;
originalScalarItems = null;
g_session = null;
g_channel = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Monitor Value Change' TESTING COMPLETE ******\n" );