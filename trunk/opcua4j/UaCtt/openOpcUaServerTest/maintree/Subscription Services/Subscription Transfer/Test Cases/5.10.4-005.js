/*  Test 5.10.4 Test 5 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Script calls publish after the subscription has been transferred 
        to a different session.

    Revision History
        30-Sep-2009 NP: Initial version, based on 5.10.5-002 by Anand Taparia.
        17-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server does not support TransferSubscription.
        07-Dec-2009 DP: Use a library class to transferSubscriptions.
        18-Feb-2011 NP: Changed expectation that StatusChange will be received on the OLD session.
        28-Feb-2011 DP: Changed to call Publish twice on the old session: first for a
                        StatusChange, second for service failure.
*/

function publish5104005()
{
    var setting1 = readSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" ).name ).toString();
    var setting2 = readSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting( "udi" ).name ).toString();
    if( setting1 === "" || setting2 === "" )
    {
        addSkipped( "Dynamic Scalar" );
        return;
    }
    var d;

    // we'll use this to reference the session that owns the subscription. Needed for clean-up.
    var subscriptionSession;

    // create subscription
    var basicSubscription = new Subscription();
    if ( createSubscription( basicSubscription, g_session[0] ) )
    {
        // create monitored items
        var monitoredItems = [
            new MonitoredItem( UaNodeId.fromString( setting1 ), 1 ),
            new MonitoredItem( UaNodeId.fromString( setting2 ), 2 )
            ];

        // Create our monitored items first, and add them to the subscription created above
        if ( createMonitoredItems( monitoredItems, TimestampsToReturn.Both, basicSubscription, g_session[0] ) )
        {    
            // call publish to get the first sequence number
            var session1Publish = new Publish( g_session[0] );
            wait( basicSubscription.RevisedPublishingInterval );
            if( session1Publish.Execute() )
            {
                // we should've received something
                AssertTrue( session1Publish.CurrentlyContainsData(), "Expected an initial dataChange in the first Publish call." );

                // transfer the subscription to another session
                var tsHelper = new transferSubscriptionsHelper( g_session[0], g_session[1], [ basicSubscription ] );
                tsHelper.Request.SendInitialValues = true;
                if( tsHelper.ExecuteAndValidate() )
                {
                    subscriptionSession = g_session[1];
                    // call Publish on the subscription.
                    // make the call from session #0 (where it was created)
                    // although the subscription should now be owned to session #1.
                    // first Publish expects a StatusChange
                    session1Publish.Execute();
                    AssertFalse( session1Publish.CurrentlyContainsData(), "Did NOT expect to receive dataChange notifications on the OLD session." );
                    AssertEqual( 1, session1Publish.ReceivedStatusChanges.length, "Did NOT receive a StatusChangeNotification in the OLD session." );

                    // second Publish expects service failure (BadNoSubscription)
                    var expectedError = new ExpectedAndAcceptedResults();
                    expectedError.addExpectedResult( StatusCode.BadNoSubscription );
                    session1Publish.Execute( undefined, expectedError, false );

                    // call Publish on the NEW session to make sure the subscription survived the transfer.
                    var session2Publish = new Publish( g_session[1] );
                    wait( basicSubscription.RevisedPublishingInterval );
                    session2Publish.Execute();
                    AssertTrue( session2Publish.CurrentlyContainsData(), "Expected to received the initial dataChange on the NEW session." );
                    AssertEqual( 0, session2Publish.ReceivedStatusChanges.length, "Did NOT expect to receive a StatusChange notification on the NEW session." );

                    // clean-up
                    session2Publish = null;
                    expectedError = null;
                }
                else
                {
                    subscriptionSession = g_session[0];
                }
                // clean-up
                tsHelper = null;
            }
            // delete the items we added in this test
            var monitoredItemsIdsToDelete = new UaUInt32s();
            for( d=0; d<monitoredItems.length; d++ )
            {
                monitoredItemsIdsToDelete[d] = monitoredItems[d].MonitoredItemId;
            }        
            deleteMonitoredItems( monitoredItemsIdsToDelete, basicSubscription, subscriptionSession );
            // CLEAN UP
            session1Publish = null;
        }
    }
    // delete the subscription we added here 
    deleteSubscription( basicSubscription, subscriptionSession );
    // clean-up
    subscriptionSession = null;
    basicSubscription = null;
    setting2 = null;
    setting1 = null;
}

safelyInvoke( publish5104005 );