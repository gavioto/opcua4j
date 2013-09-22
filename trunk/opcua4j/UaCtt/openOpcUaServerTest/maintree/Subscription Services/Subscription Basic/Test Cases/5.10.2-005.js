/*  Test 5.10.2 Test case 5 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Modifies a subsription setting RequestedPublishingInterval=1; 
        Server returns fastest possible value which != 0.

    Revision History 
        01-Sep-2009 NP: Initial version
        21-Oct-2009 NP: Revised to use new script library functions.
        20-Nov-2009 NP: Revised to meet the needs of the new test-case.
                        REVIEWED.
*/

function modifySubscription5102005()
{
    var subscription = new Subscription();
    if( createSubscription( subscription, g_session ) )
    {
        if( createMonitoredItems( defaultStaticItem, TimestampsToReturn.Both, subscription, g_session ) )
        {
            var modifySubService = new ModifySubscription( g_session );
            subscription.SetParameters( 1 );
            modifySubService.Execute( subscription );
            // check the revised publishingInterval matches the fastest the server supports
            AssertCoercedEqual( fastestPublishingIntervalSupported, subscription.RevisedPublishingInterval, "RevisedPublishingInterval is not set to the fatest value the UA Server supports." );
            deleteMonitoredItems( defaultStaticItem, subscription, g_session );
        }
    }
    deleteSubscription( subscription, g_session );
}

safelyInvoke( modifySubscription5102005 );