/*  Test 5.10.3 Test 10 prepared by Anand Taparia; ataparia@kepwaare.com

    Description:
        Script modifies the publishing mode for a subscription that was transferred.

    Revision History
        24-Sep-2009 AT: Initial version.
        17-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server does not support TransferSubscription.
        07-Dec-2009 DP: Use a library class to transferSubscriptions.
        25-Jan-2010 DP: Find a NodeId setting instead of using a hard-coded one.
        11-Feb-2011 DP: Changed expectation of DataChanges to StatusChanges.
        18-Feb-2011 NP: Changed expectation that StatusChange will be received on the OLD session.
        25-Feb-2011 DP: Fixed to match test case.
*/

function setPublishingMode5103010()
{
    var subscription = new Subscription();
    // Create subscription in the first session
    if ( !createSubscription( subscription, g_session[0] ) )
    {
        return;
    }
    // add a monitoredItem to the subscription
    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( nodeSetting === undefined || nodeSetting === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    var item = MonitoredItem.fromSetting( nodeSetting.name, 0 );
    createMonitoredItems( item, TimestampsToReturn.Both, subscription, g_session[0] );

    // lets call Publish to make sure that we do receive an initial dataChange.
    var session1Publish = new Publish( g_session[0] );
    wait( subscription.RevisedPublishingInterval );
    session1Publish.Execute();
    AssertTrue( session1Publish.CurrentlyContainsData(), "Expected to receive the initial value (dataChange)." );

    // write a value so we can write a different value later
    GenerateScalarValue( item.Value.Value, NodeIdSettings.guessType( item.NodeSetting ), 1 );
    var writeService1 = new Write( g_session[0] );
    writeService1.Execute( item );

    // Transfer the above subscription to the second session
    var tsHelper = new transferSubscriptionsHelper( g_session[0], g_session[1], [ subscription ] );
    tsHelper.Request.SendInitialValues = true;
    if( tsHelper.ExecuteAndValidate() )
    {
        // Call Publish on the OLD session, we don't expect dataChanges but DO EXPECT a statusChange
        wait( subscription.RevisedPublishingInterval );
        session1Publish.Execute();
        AssertFalse( session1Publish.CurrentlyContainsData(), "Did not expect to receive a dataChange on the old Session (we previously moved the subscription to another session)." );
        AssertGreaterThan( 0, session1Publish.ReceivedStatusChanges.length, "Expected a statusChange in the OLD session to inform us that we no longer have the subscription." );

        // now to verify the subscription is not affected by calling Publish from the other session
        var session2Publish = new Publish( g_session[1] );

        // wait and then call Publish (the subscription was created Enabled=True) - we should get an initial value.
        wait( subscription.RevisedPublishingInterval );
        session2Publish.Execute();
        AssertEqual( true, session2Publish.CurrentlyContainsData(), "Expected a dataChange from our transferred subscription." );
        AssertEqual( 0, session2Publish.ReceivedStatusChanges.length, "Incorrectly received a StatusChangeNotification in the NEW session." );

        session2Publish.ClearServerNotifications();
        session2Publish.Clear();

        // Modify the publish mode for the subscription on the old Session 
        var setPublishingModeRequest = new UaSetPublishingModeRequest();
        var setPublishingModeResponse = new UaSetPublishingModeResponse();
        g_session[0].buildRequestHeader( setPublishingModeRequest.RequestHeader );

        setPublishingModeRequest.PublishingEnabled = false;
        setPublishingModeRequest.SubscriptionIds[0] = subscription.SubscriptionId;

        var uaStatus = g_session[0].setPublishingMode( setPublishingModeRequest, setPublishingModeResponse );
        if( uaStatus.isGood() )
        {
            var ExpectedOperationResultsArray = [];
            ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
            checkSetPublishingModeError( setPublishingModeRequest, setPublishingModeResponse, ExpectedOperationResultsArray );
        }
        else
        {
            addError( "SetPublishingMode() status " + uaStatus, uaStatus );        
        }

        // write a new value to the item
        GenerateScalarValue( item.Value.Value, NodeIdSettings.guessType( item.NodeSetting ), 2 );
        var writeService = new Write( g_session[1] );
        writeService.Execute( item );

        // wait and then call Publish (subscription state should now be Inactive).
        wait( subscription.RevisedPublishingInterval );
        session2Publish.Execute();
        AssertTrue( session2Publish.CurrentlyContainsData(), "Expected a dataChange from our transferred subscription." );
        AssertEqual( 0, session2Publish.ReceivedStatusChanges.length, "Incorrectly received a StatusChangeNotification in the NEW session." );

        // clean-up
        // delete subscription added above
        deleteMonitoredItems( item, subscription, g_session[1] );
        deleteSubscription( subscription, g_session[1] );
        usStatus = null;
        setPublishingModeResponse = null;
        setPublishingModeRequest = null;
        session2Publish = null;
    }
    else
    {
        // delete the original subscription added above
        deleteSubscription( subscription, g_session[0] );
    }
    // clean up
    tsHelper = null;
    session1Publish = null;
    item = null;
    subscription = null;
}

safelyInvoke( setPublishingMode5103010 );