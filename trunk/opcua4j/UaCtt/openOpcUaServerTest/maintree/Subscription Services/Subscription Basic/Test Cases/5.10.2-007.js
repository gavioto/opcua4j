/*  Test 5.10.2 Test case 7 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Modifies a subsription setting RequestedPublishingInterval=Max Float;
        Server should revise the value to a value it supports.
    Revision History 
        08-Sep-2009 NP: Initial version
        21-Oct-2009 NP: Revised to use new script library functions.
        15-Dec-2009 DP: Changed Max Int32 to Max Float.
*/

function modifySubscription5102007()
{
    var subscription = new Subscription();
    if( createSubscription( subscription, g_session ) )
    {
        if( createMonitoredItems( defaultStaticItem, TimestampsToReturn.Both, subscription, g_session ) )
        {
            var modifySubService = new ModifySubscription( g_session );
            subscription.SetParameters( Constants.Float_Max );
            modifySubService.Execute( subscription );
            // check the revised publishingInterval matches the fastest the server supports
            AssertNotEqual( Constants.Float_Max, subscription.RevisedPublishingInterval, "ModifySubscription's RevisedPublishingInterval should not support such large numbers." );
            deleteMonitoredItems( defaultStaticItem, subscription, g_session );
        }
    }
    deleteSubscription( subscription, g_session );
}

safelyInvoke( modifySubscription5102007 );