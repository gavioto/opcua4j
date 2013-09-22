/*  Test 5.10.1 Test 20, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create 10 subscriptions.
        This is executed by:
            a) creating 1 subscription per Session, with 10 sessions.
            b) creating 10 subscriptions per Session, with 1 session.
            c) creating 5 subscriptions per Session, with 2 sessions.

    Revision History
        08-Sep-2009 NP: Initial version.
        17-Nov-2009 NP: REVIEWED.
*/

function createSubscription5101020()
{
    var sessionCount = 1;
    var subscriptionCount = 10;
    MultiSessionMultiSubscribeTest( g_channel, sessionCount, subscriptionCount, monitoredItem );

    sessionCount = 10;
    subscriptionCount = 1;
    MultiSessionMultiSubscribeTest( g_channel, sessionCount, subscriptionCount, monitoredItem );

    sessionCount = 5;
    subscriptionCount = 2;
    MultiSessionMultiSubscribeTest( g_channel, sessionCount, subscriptionCount, monitoredItem );
}

safelyInvoke( createSubscription5101020 );