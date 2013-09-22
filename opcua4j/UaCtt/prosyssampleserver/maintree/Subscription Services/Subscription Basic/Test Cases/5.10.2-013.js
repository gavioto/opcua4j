/*  Test 5.10.2 Test case 13 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Modifies a subsription setting requestedLifetimeCounter 
        is less than 3x requestedMaxKeepAliveCount, values are 100, 200.
        Server expected to set revisedLifetimeCounter to at least 3
        times that of the revisedMaxKeepAliveCount.

    Revision History 
        01-Sep-2009 NP: Initial version.
        21-Oct-2009 NP: Revised to use new script library functions.
        20-Nov-2009 NP: REVIEWED.
*/

function modifySubscription5102013()
{
    var subscription = new Subscription();
    var modifySubService = new ModifySubscription( g_session );
    if( createSubscription( subscription, g_session ) )
    {
        // modify subscription
        subscription.SetParameters( null, null, 200, 100 );
        addLog( "Changing the lifetimeCount to: " + subscription.LifetimeCount );
        addLog( "Changing the maxKeepAliveCount to: " + subscription.MaxKeepAliveCount );
        AssertEqual( true, modifySubService.Execute( subscription ) );
    }
    // delete the subscription we added here 
    deleteSubscription( subscription, g_session );
}

safelyInvoke( modifySubscription5102013 );