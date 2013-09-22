print( "\n\n\n***** CONFORMANCE UNIT 'View Basic' TEST SCRIPTS COMPLETE ******\n" );

include("./library/Base/disconnect.js")

// disconnect from server
disconnect( Channel, Session );

// clean-up
BrowseHelper = null;
Channel = null;
Session = null;

print( "\n\n\n***** CONFORMANCE UNIT 'View Basic' TESTING COMPLETE ******\n" );