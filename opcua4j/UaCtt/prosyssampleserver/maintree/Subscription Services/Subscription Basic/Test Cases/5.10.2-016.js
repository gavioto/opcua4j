/*  Test 5.10.2 Test case 16 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Modifies a subsription setting RequestedLifetimeCounter is max UInt32/2
        and requestedMaxKeepAliveCount is max UInt32.
        Server expected to revise as best as possible.

    Revision History
        01-Sep-2009 NP: Initial version
        21-Oct-2009 NP: Revised to use new script library functions.
*/

function modifySubscription5102016()
{
    var subscription = new Subscription();
    var modifySubService = new ModifySubscription( g_session );
    if( createSubscription( subscription, g_session ) )
    {
        // modify subscription
        subscription.SetParameters( 1000, null, (Constants.UInt32/2), Constants.UInt32, 0, 0 );
        addLog( "Changing the lifetimeCount to: " + subscription.LifetimeCount );
        addLog( "Changing the maxKeepAliveCount to: " + subscription.MaxKeepAliveCount );
        modifySubService.Execute( subscription );
    }
    // delete the subscription we added here 
    deleteSubscription( subscription, g_session );
}

safelyInvoke( modifySubscription5102016 );