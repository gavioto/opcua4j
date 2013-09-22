print( "\n\n\n***** CONFORMANCE UNIT 'Subscription Transfer' TEST SCRIPTS COMPLETE ******\n" );

// close sessions
for( var i=0; i<g_session.length; i++ )
{
    closeSession( g_session [i] );
}

// disconnect channel
disconnectChannel( g_channel );

// clean-up
g_session = null;
g_channel = null;
SESSIONCREATECOUNT = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Subscription Transfer' TESTING COMPLETE ******\n" );