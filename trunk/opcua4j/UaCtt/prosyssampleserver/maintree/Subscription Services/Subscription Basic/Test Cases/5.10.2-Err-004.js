/*  Test 5.10.2 Error case 4 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Specifies requestedPublishingInterval as a NaN.
        The test assumes that the Server will treat NaN the same as it would 0/zero.

    Revision History
        12-Nov-2009 NP: Initial version.
        20-Nov-2009 NP: REVIEWED.
*/

function modifySubscription5102Err004()
{
    var subscription = new Subscription();
    var modifySubService = new ModifySubscription( g_session );
    if( createSubscription( subscription, g_session ) )
    {
        // modify subscription
        subscription.SetParameters( NaN ); //publishingInterval
        modifySubService.Execute( subscription );
        AssertCoercedEqual( fastestPublishingIntervalSupported, subscription.RevisedPublishingInterval, "Expected UA Server to revise the publishingInterval to its fastest supported value." );
    }
    // delete the subscription we added here 
    deleteSubscription( subscription, g_session );
}

safelyInvoke( modifySubscription5102Err004 );