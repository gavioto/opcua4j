/*  Test 5.10.1 test 1 prepared by Development; compliance@opcfoundation.org
    Description:
        Creates a subscription using the default parameters.

    Revision History
        24-Aug-2009 DEV: Initial version.
        20-Nov-2009 NP : REVIEWED.
        
    MORE INFORMATION:
        Refer to Test Lab Part 8 specifications, section 5.10.1.
*/

function createSubscription5101001()
{
    var subscription = new Subscription();
    if( createSubscription( subscription, g_session ) )
    {
        if( createMonitoredItems( defaultStaticItem, TimestampsToReturn.Both, subscription, g_session ) )
        {
            var publishService = new Publish( g_session );
            wait( subscription.RevisedPublishingInterval );
            AssertTrue( publishService.Execute() && publishService.CurrentlyContainsData(), "Expected Publish to yield a DataChange notification (initial value for the monitoredItem." );
            deleteMonitoredItems( defaultStaticItem, subscription, g_session );
        }
    }
    deleteSubscription( subscription, g_session );
}

safelyInvoke( createSubscription5101001 );