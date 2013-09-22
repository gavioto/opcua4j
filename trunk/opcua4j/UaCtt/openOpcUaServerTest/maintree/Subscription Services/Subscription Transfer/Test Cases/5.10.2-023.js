/*  Test 5.10.2 Test 23 prepared by Anand Taparia; ataparia@kepwaare.com
    Description:
        Script modifies a subscription that had been transferred to another 
        session.
        The old/original session receives a statusChange notification.

    Revision History
        20-Sep-2009 AT: Initial version.
        17-Nov-2009 NP: Revised to meet the new needs of the test-case.
                        REVIEWED/INCONCLUSIVE. Server does not support TransferSubscription.
        07-Dec-2009 DP: Use a library class to transferSubscriptions.
        10-Feb-2011 DP: Fixed to expect a service failure from ModifySubscription instead of
                        an operation error.
        18-Feb-2011 NP: Revised, statusChange expected on OLD session now, not new session. (credit: MI)
*/


function modifySubscription5102023()
{
    var subscription = new Subscription();

    var nodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Boolean, "i", "u", "d" ] );
    if( nodeId === undefined || nodeId === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    var item = MonitoredItem.fromSetting( nodeId.name, 0 );
    // Create subscription in the first session
    if ( !createSubscription( subscription, g_session[0] ) )
    {
        return;
    }
    // create the monitoredItem, wait and then call Publish 
    createMonitoredItems( item, TimestampsToReturn.Both, subscription, g_session[0] );
    var session1Publish = new Publish( g_session[0] );
    wait( subscription.RevisedPublishingInterval );
    session1Publish.Execute();
    AssertTrue( session1Publish.CurrentlyContainsData(), "Expected to receive the initial value (dataChange)." );

    // Transfer the above subscription to the second session
    var tsHelper = new transferSubscriptionsHelper( g_session[0], g_session[1], [ subscription ] );
    tsHelper.Request.SendInitialValues = true;
    if( !tsHelper.ExecuteAndValidate() )
    {
        // delete subscription added above
        deleteSubscription( subscription, g_session[0] );
        return;
    }

    // Modify the subscription as was attached to the first session 
    var modifySubscriptionRequest = new UaModifySubscriptionRequest();
    var modifySubscriptionResponse = new UaModifySubscriptionResponse();
    g_session[0].buildRequestHeader( modifySubscriptionRequest.RequestHeader );

    modifySubscriptionRequest.PublishingInterval = 2000;
    modifySubscriptionRequest.SubscriptionId = subscription.SubscriptionId;

    var uaStatus = g_session[0].modifySubscription( modifySubscriptionRequest, modifySubscriptionResponse );
    if( uaStatus.isGood() )
    {
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
        var ExpectedOperationResultsArray = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
        checkModifySubscriptionFailed( modifySubscriptionRequest, modifySubscriptionResponse, ExpectedOperationResultsArray );

        // we need to call publish now, in the other session to make sure that we do indeed
        wait( subscription.RevisedPublishingInterval );

        // call publish on the NEW session, we don't expect a statusChange, but do expect a dataChange
        var session2Publish = new Publish( g_session[1] );
        session2Publish.Execute();
        AssertTrue( session2Publish.CurrentlyContainsData(), "Expected to receive the initial values of the data in the NEW session." );
        AssertFalse( session2Publish.ReceivedStatusChanges.length, "Incorrectly received a StatusChangeNotification in the NEW session." );

        // call Publish on the old session, we should get a statusChange notification
        session1Publish.Execute();
        AssertFalse( session1Publish.CurrentlyContainsData(), "Did not expect to receive dataChange notifications on this old session." );
        AssertGreaterThan( 0, session1Publish, session1Publish.ReceivedStatusChanges.length, "Expected a StatusChange notification on the old session." );

        // delete subscription added above and then clean-up.
        deleteSubscription( subscription, g_session[1] );
        session2Publish = null;
        ExpectedOperationResultsArray = null;
    }
    else
    {
        addError( "ModifySubscription() status " + uaStatus, uaStatus );
    }
    // delete subscription added above
    deleteSubscription( subscription, g_session[0] );
    // clean-up
    modifySubscriptionResponse = null;
    modifySubscriptionRequest = null;
    tsHelper = null;
    session1Publish = null;
    item = null;
    subscription = null;
    nodeId = null;
}

safelyInvoke( modifySubscription5102023 );