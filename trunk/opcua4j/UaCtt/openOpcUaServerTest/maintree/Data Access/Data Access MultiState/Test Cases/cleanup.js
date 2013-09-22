print( "\n\n\n***** CONFORMANCE UNIT 'Data Access MultiState' TEST SCRIPTS COMPLETE ******\n" );

// disconnect from server
if( PublishHelper !== undefined && PublishHelper !== null )
{
    PublishHelper.Clear();
}
disconnect( g_channel, g_session );

// clean-up
WriteHelper = null;
ReadHelper = null;
PublishHelper = null;
g_session = null;
g_channel = null;
multiStateItems = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Data Access MultiState' TESTING COMPLETE ******\n" );