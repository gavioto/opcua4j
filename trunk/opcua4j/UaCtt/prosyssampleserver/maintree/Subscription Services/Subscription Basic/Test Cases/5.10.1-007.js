/*  Test 5.10.1 test 7 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create a subscription where requestedLifetimeCounter is equal to requestedMaxKeepAliveCount.
        ServiceResult = Good.
        revisedLifetimeCounter returns a value at least 3 times that of the revisedMaxKeepAliveCount.
        All other parameter values are valid and correct. If the revised is not 3x then the test
        is fail!

    Revision History
        25-Aug-2009 NP: Initial version.
        17-Nov-2009 NP: Revised to meet new test-case definition.
                        REVIEWED.
        
    MORE INFORMATION:
        Refer to Test Lab Part 8 specifications, section 5.10.1.
*/

function createSubscription5101007()
{
    var subscription = new Subscription( null, null, 3, 3 );
    if( createSubscription( subscription, g_session ) )
    {
        // check that the subscription works anyway.
        if( createMonitoredItems( defaultStaticItem, TimestampsToReturn.Both, subscription, g_session ) )
        {
            // wait one cycle before calling publish
            wait( subscription.RevisedPublishingInterval );
            AssertEqual( true, publishService.Execute() && publishService.CurrentlyContainsData(), "Expected Publish() to succeed, and to contain a dataChange." );
            deleteMonitoredItems( defaultStaticItem, subscription, g_session );
        }
    }
    deleteSubscription( subscription, g_session );
    publishService.Clear();
}

safelyInvoke( createSubscription5101007 );