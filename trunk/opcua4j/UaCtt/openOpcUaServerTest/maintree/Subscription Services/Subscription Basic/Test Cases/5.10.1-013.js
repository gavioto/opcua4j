/*  Test 5.10.1 test 13 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create a subscription where requestedLifetimeCounter is max UInt32 and requestedMaxKeepAliveCount is max UInt32.
        ServiceResult = Good
        All returned parameter values are valid and correct. revisedLifetimeCounter is at least 
        3 times that of the revisedMaxKeepAliveCount.

    Revision History
        25-Aug-2009 NP: Initial version.
        20-Nov-2009 NP: REVIEWED.

    MORE INFORMATION:
        Refer to Test Lab Part 8 specifications, section 5.10.1.
*/

function createSubscription5101013()
{
    const PUBLISHINGENABLED = true;
    const REQUESTEDLIFTETIME = Constants.UInt32_Max; //injection;
    const REQUESTEDMAXKEEPALIVE = Constants.UInt32_Max; //injection;
    const MAXNOTIFICATIONS = 0;
    const PRIORITY = 0;

    var subscription = new Subscription( null, PUBLISHINGENABLED, REQUESTEDLIFTETIME, REQUESTEDMAXKEEPALIVE, MAXNOTIFICATIONS, PRIORITY );
    if( createSubscription( subscription, g_session ) )
    {
        // check that the subscription works anyway.
        if( createMonitoredItems( defaultStaticItem, TimestampsToReturn.Both, subscription, g_session ) )
        {
            wait( subscription.RevisedPublishingInterval );
            publishService.Execute();
            AssertTrue( publishService.CurrentlyContainsData(), "Expected Publish() to succeed, and to contain a dataChange." );
            deleteMonitoredItems( defaultStaticItem, subscription, g_session );
        }
    }
    deleteSubscription( subscription, g_session );
    publishService.Clear();
}

safelyInvoke( createSubscription5101013 );