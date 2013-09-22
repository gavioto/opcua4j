/*  Test 5.10.2 Test case 8 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Modifies a subsription setting RequestedLifetimeCount and RequestedMaxKeepAliveCount
        variables to different values.

    Revision History 
        08-Sep-2009 NP: Initial version
        21-Oct-2009 NP: Revised to use new script library functions.
        12-Nov-2009 NP: Revised to meet new test-case requirements.
        20-Nov-2009 NP: REVIEWED.
*/

function modifySubscription5102008()
{
    const OFFSET = 0x1234;
    var modifySubService = new ModifySubscription( g_session );

    var subscription = new Subscription();
    if( createSubscription( subscription, g_session ) )
    {
        print( "\n(1) lifetimeCount > current && keepAlive > current" );
        subscription.SetParameters( null, null, subscription.RevisedLifetimeCount + OFFSET, subscription.RevisedMaxKeepAliveCount + OFFSET );
        modifySubService.Execute( subscription );

        print( "\n(2) lifetimeCount < current && keepAlive > current" );
        subscription.SetParameters( null, null, subscription.RevisedLifetimeCount - OFFSET, subscription.RevisedMaxKeepAliveCount + OFFSET );
        modifySubService.Execute( subscription );

        print( "\n(3) lifetimeCount = current && keepAlive > current" );
        subscription.SetParameters( null, null, subscription.RevisedLifetimeCount, subscription.RevisedMaxKeepAliveCount + OFFSET );
        modifySubService.Execute( subscription );

        print( "\n(4) lifetimeCount > current && keepAlive < current" );
        subscription.SetParameters( null, null, subscription.RevisedLifetimeCount + OFFSET, subscription.RevisedMaxKeepAliveCount - OFFSET );
        modifySubService.Execute( subscription );

        print( "\n(5) lifetimeCount < current && keepAlive < current ");
        subscription.SetParameters( null, null, subscription.RevisedLifetimeCount - OFFSET, subscription.RevisedMaxKeepAliveCount - OFFSET );
        modifySubService.Execute( subscription );

        print( "\n(6) lifetimeCount = current && keepAlive < current" );
        subscription.SetParameters( null, null, subscription.RevisedLifetimeCount, subscription.RevisedMaxKeepAliveCount - OFFSET);
        modifySubService.Execute( subscription );

        print( "\n(7) lifetimeCount > current && keepAlive = current" );
        subscription.SetParameters( null, null, subscription.RevisedLifetimeCount + OFFSET, subscription.RevisedMaxKeepAliveCount );
        modifySubService.Execute( subscription );

        print( "\n(8) lifetimeCount < current && keepAlive = current" );
        subscription.SetParameters( null, null, subscription.RevisedLifetimeCount - OFFSET, subscription.RevisedMaxKeepAliveCount );
        modifySubService.Execute( subscription );

        print( "\n(9) lifetimeCount = current && keepAlive = current" );
        subscription.SetParameters( null, null, subscription.RevisedLifetimeCount, subscription.RevisedMaxKeepAliveCount );
        modifySubService.Execute( subscription );
    }
    // delete the subscription we added here 
    deleteSubscription( subscription, g_session );
}

safelyInvoke( modifySubscription5102008 );