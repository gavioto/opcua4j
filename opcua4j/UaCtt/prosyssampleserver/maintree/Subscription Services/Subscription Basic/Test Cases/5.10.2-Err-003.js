/*  Test 5.10.2 Error case 3 prepared by Development; compliance@opcfoundation.org
    Description:
        Specifies a negative number for the publishing interval.

    Revision History
        24-Aug-2009 DEV: Initial version.
        20-Nov-2009 NP: Revised to use new Script library objects.
                        REVIEWED.
*/

function modifySubscription5102Err003()
{
    var subscription = new Subscription();
    var modifySubService = new ModifySubscription( g_session );
    if( createSubscription( subscription, g_session ) )
    {
        // modify subscription
        subscription.SetParameters( -5 ); //publishingInterval
        modifySubService.Execute( subscription );
        AssertCoercedEqual( fastestPublishingIntervalSupported, subscription.RevisedPublishingInterval, "Expected UA Server to revise the publishingInterval to its fastest supported value." );
    }
    // delete the subscription we added here 
    deleteSubscription( subscription, g_session );
}

safelyInvoke( modifySubscription5102Err003 );