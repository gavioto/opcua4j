/*  Test 5.10.1 Error test 1 prepared by Development; compliance@opcfoundation.org
    Description:
        Create a subscription where the requested publishing interval is a negative number.

    Revision History
        24-Aug-2009 DEV: Initial version.
        21-Oct-2009 NP : Migrated to use new script library functions.
        20-Nov-2009 NP : REVIEWED.

    MORE INFORMATION:
        Refer to Test Lab Part 8 specifications, section 5.10.1.
*/

function createSubscription5101Err001()
{
    const NEGATIVE_PUBLISHING_INTERVAL = -12.34;
    var subscription = new Subscription( NEGATIVE_PUBLISHING_INTERVAL, true, 15, 5, 0, 0 );
    if( createSubscription( subscription, g_session ) )
    {
        AssertNotEqual( NEGATIVE_PUBLISHING_INTERVAL, subscription.RevisedPublishingInterval, "Server expected to revise PublishingInterval from " + NEGATIVE_PUBLISHING_INTERVAL );
    }
    deleteSubscription( subscription, g_session );
}

safelyInvoke( createSubscription5101Err001 );