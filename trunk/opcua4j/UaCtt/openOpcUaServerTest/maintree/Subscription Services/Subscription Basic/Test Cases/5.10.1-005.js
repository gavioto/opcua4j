/*  Test 5.10.1 test 5 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Creates a subscription where the requestedLifetimeCounter=0, the
        requestedMaxKeepAliveCount=0.
        The server is expected to revise both values to what it supports.
        RevisedLifetimeCount must be by minimum 3x larger than revisedMaxKeepAliveCount.

    Revision History
        25-Aug-2009 NP: Initial version.
        20-Nov-2009 NP: REVIEWED.
        
    MORE INFORMATION:
        Refer to Test Lab Part 8 specifications, section 5.10.1.
*/

function createSubscription5101005()
{
    var subscription = new Subscription( null, null, 0, 0 );
    if( createSubscription( subscription, g_session ) )
    {
        // check that the subscription works anyway.
        if( createMonitoredItems( defaultStaticItem, TimestampsToReturn.Both, subscription, g_session ) )
        {
            wait( subscription.RevisedPublishingInterval );
            AssertTrue( publishService.Execute() && publishService.CurrentlyContainsData(), "Expected Publish() to succeed, and to contain a dataChange." );
            deleteMonitoredItems( defaultStaticItem, subscription, g_session );
        }
    }
    deleteSubscription( subscription, g_session );
    // clear the publish object's properties...
    publishService.Clear();
}

safelyInvoke( createSubscription5101005 );