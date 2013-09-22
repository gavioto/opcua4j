/*  Test 5.10.1 test 3 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Creates a subscription requesting 0 as the requestedPublishingInterval.
        The Server should reject this and set it to a value that it supports.

    Revision History
        25-Aug-2009 NP: Initial version.
        20-Nov-2009 NP: REVIEWED.
        
    MORE INFORMATION:
        Refer to Test Lab Part 8 specifications, section 5.10.1.
*/

function createSubscription5101003()
{
    var subscription = new Subscription( 0 );
    if( createSubscription( subscription, g_session ) )
    {
        AssertNotEqual( 0, subscription.RevisedPublishingInterval, "Expected the server to revise the publishingInterval from 0." );

        // check that the subscription works anyway.
        if( createMonitoredItems( defaultStaticItem, TimestampsToReturn.Both, subscription, g_session ) )
        {
            wait( subscription.RevisedPublishingInterval );
            publishService.Execute();
            AssertTrue( publishService.CurrentlyContainsData(), "Expected a dataChange from an active subscription." );
            deleteMonitoredItems( defaultStaticItem, subscription, g_session );
        }
    }
    deleteSubscription( subscription, g_session );
    // clear the publish object's properties...
    publishService.Clear();
}

safelyInvoke( createSubscription5101003 );