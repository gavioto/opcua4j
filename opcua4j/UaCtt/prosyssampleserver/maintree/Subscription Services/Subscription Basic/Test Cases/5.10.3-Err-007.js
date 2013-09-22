/*  Test 5.10.3 Error test case 7 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        No subscriptions have been previously set-up in the session.
        Call SetPublishingMode (Enabled=true) for a SubscriptionId of 1.

    Revision History
        17-Nov-2009 NP: Initial version.
        17-Jun-2011 NP: Temporarily clears the existing session, reinstating it at the end.
                        Makes for embedded-friendly script.
*/

function setPublishingMode5103Err007()
{
    // clear the existing session and subscription.
    disconnect( g_channel, g_session );

    // we need to create a new session for this test
    var privateChannel = new UaChannel();
    var privateSession = new UaSession( privateChannel );
    if( !connect( privateChannel, privateSession ) )
    {
        return;
    }

    // create a fictitious subscription of id = 1
    var subscription = new Subscription();
    subscription.SubscriptionId = 1;

    // now to call setPublishingMode, which we expect to fail
    var setPublishingModeService = new SetPublishingMode( privateSession );
    var expectedResult = [ new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) ];
    setPublishingModeService.Execute( subscription, true, expectedResult, true );

    // clean-up
    disconnect( privateChannel, privateSession );

    // reinstate the CU-wide session: 
    connect( g_channel, g_session );
}

safelyInvoke( setPublishingMode5103Err007 );