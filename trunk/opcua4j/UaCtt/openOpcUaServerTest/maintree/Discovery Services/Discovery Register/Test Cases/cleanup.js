include( "./library/Base/disconnectChannel.js" )

// disconnect from server
disconnectChannel( f_channel );

// clean-up
g_discovery = null;
f_channel = null;