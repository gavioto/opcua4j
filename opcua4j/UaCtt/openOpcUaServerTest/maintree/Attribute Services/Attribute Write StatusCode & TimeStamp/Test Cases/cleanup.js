print( "\n\n\n***** CONFORMANCE UNIT 'Attribute Write StatusCode & Timestamp' TEST SCRIPTS COMPLETE ******\n" );

include("./library/Base/disconnect.js")

// disconnect from server
disconnect(g_channel, g_session)

// clean-up
PublishHelper = null;
WriteHelper = null;
ReadHelper = null;
MonitorBasicSubscription = null;
ATTRIBUTE_WRITE_STATUSCODE_TIMESTAMP_NODE_TO_WRITE = null;
g_session = null;
g_channel = null;
scalarNodes = null;
SKIPWRITEVERIFICATION = null;
OPTIONAL_CONFORMANCEUNIT = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Attribute Write StatusCode & Timestamp' TESTING COMPLETE ******\n" );