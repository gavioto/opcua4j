/*  Test 5.10.1 Test 19, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create 5 subscriptions.
        This is executed by:
            a) creating 1 subscription per Session, with 5 sessions.
            b) creating 5 subscriptions per Session, with 1 session.

    Revision History
        08-Sep-2009 NP: Initial version.
        17-Nov-2009 NP: REVIEWED.
*/

function createSubscription5101019()
{
    var sessionCount = 1;
    var subscriptionCount = 5;
    MultiSessionMultiSubscribeTest( g_channel, sessionCount, subscriptionCount, monitoredItem );

    sessionCount = 5;
    subscriptionCount = 1;
    MultiSessionMultiSubscribeTest( g_channel, sessionCount, subscriptionCount, monitoredItem );
}

safelyInvoke( createSubscription5101019 );