print( "\n\n\n***** CONFORMANCE UNIT 'Session Minimum 50 Parallel' TEST SCRIPTS COMPLETE ******\n" );

for( var i = 0; i < g_sessionCount; i++ )
{
    addLog( "Closing session #" + (1+i) + "; SessionId: " + g_sessions[i].SessionId );
    closeSession( g_sessions[i] );
}

disconnectChannel( g_channel );

// clean-up
g_sessions = null;
g_sessionCount = null;
g_channel = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Session Minimum 50 Parallel' TESTING COMPLETE ******\n" );