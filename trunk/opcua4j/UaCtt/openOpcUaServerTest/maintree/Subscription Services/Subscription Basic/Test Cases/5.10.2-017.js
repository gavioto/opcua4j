/*  Test 5.10.2 Test case 17 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Modifies a subsription setting RequestedLifetimeCounter is max UInt32
        and requestedMaxKeepAliveCount is max UInt32.
        Server expected to revise as best as possible.

    Revision History 
        01-Sep-2009 NP: Initial version
        21-Oct-2009 NP: Revised to use new script library functions.
        20-Nov-2009 NP: REVIEWED.
*/

function modifySubscription5102017()
{
    var subscription = new Subscription();
    var modifySubService = new ModifySubscription( g_session );
    if( createSubscription( subscription, g_session ) )
    {
        // modify subscription
        subscription.SetParameters( null, null, Constants.UInt32_Max, Constants.UInt32_Max );
        addLog( "Changing the lifetimeCount to: " + subscription.LifetimeCount );
        addLog( "Changing the maxKeepAliveCount to: " + subscription.MaxKeepAliveCount );
        AssertEqual( true, modifySubService.Execute( subscription ) );
    }
    // delete the subscription we added here 
    deleteSubscription( subscription, g_session );
}

safelyInvoke( modifySubscription5102017 );