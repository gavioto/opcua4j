/*  Test 5.10.1 Error test 3 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Create a subscription where the requested publishing interval is a not a number.

    Revision History
        24-Aug-2009 NP: Initial version
        21-Oct-2009 NP: Revised to use new script library objects.
        20-Nov-2009 NP: REVIEWED. (extra code to be removed when OPCF server fixed)

    MORE INFORMATION:
        Refer to Test Lab Part 8 specifications, section 5.10.1.
*/

function createSubscription5101Err003()
{
    var subscription = new Subscription( NaN );
    if( createSubscription( subscription, g_session ) )
    {
        AssertNotEqual( NaN, subscription.RevisedPublishingInterval, "Server expected to revise the PublishingInterval from NaN" );
    }
    deleteSubscription( subscription, g_session );
}

safelyInvoke( createSubscription5101Err003 );