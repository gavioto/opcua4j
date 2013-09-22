/*  Test 5.10.1 test 4 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create a subscription where the requestedPublishingInterval is the
        max size of a FLOAT.

    Revision History
        25-Aug-2009 NP: Initial version.
        20-Nov-2009 NP: REVIEWED.
        
    MORE INFORMATION:
        Refer to Test Lab Part 8 specifications, section 5.10.1.
*/

function createSubscription5101004()
{
    var subscription = new Subscription( Constants.Double_Max );
    if( createSubscription( subscription, g_session ) )
    {
        AssertNotEqual( Constants.Double_Max, subscription.RevisedPublishingInterval, "Expected the server to revise the publishingInterval from Float_Max." );
    }
    deleteSubscription( subscription, g_session );
}

safelyInvoke( createSubscription5101004 );