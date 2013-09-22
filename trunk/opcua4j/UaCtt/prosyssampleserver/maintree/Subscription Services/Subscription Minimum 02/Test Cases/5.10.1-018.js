/*  Test 5.10.1 Test 18, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create 2 subscriptions per session.
        Create 1 session.

    Revision History
        02-Sep-2009 NP: Initial version.
        17-Nov-2009 NP: REVIEWED.
*/

function session5101018()
{
    // detach the session created in "initialize.js"
    closeSession( g_session );

    const SESSIONCOUNT = 1;
    const SUBSCRIPTIONCOUNT = 2;
    MultiSessionMultiSubscribeTest( g_channel, SESSIONCOUNT, SUBSCRIPTIONCOUNT, monitoredItem );

    // reconnect the session defined in "initialize.js"
    if( !connectSession( g_channel, g_session ) )
    {
        addError( "Connect failed. Stopping execution of current conformance unit.");
        stopCurrentUnit();
    }
}

safelyInvoke( session5101018 );