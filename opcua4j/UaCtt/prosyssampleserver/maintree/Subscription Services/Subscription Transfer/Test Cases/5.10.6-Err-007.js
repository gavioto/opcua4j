/*  Test 5.10.6 Error Test 7 prepared by Anand Taparia; ataparia@kepwaare.com
    Description:
        Script deletes a subscription that has been transferred to another session

    Revision History
        22-Sep-2009 AT: Initial version.
        17-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server does not support TransferSubscription.
        07-Dec-2009 DP: Use a library class to transferSubscriptions.
        18-Feb-2011 NP: Expect a StatusChange notification on the original session.
*/

function deleteSubscription5106Err007()
{
    var subscription = new Subscription();

    // add a monitoredItem to the subscription
    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( nodeSetting === undefined || nodeSetting === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    var item = MonitoredItem.fromSetting( nodeSetting.name, 0 );
    // Create subscription in the first session
    if( !createSubscription( subscription, g_session[0] ) )
    {
        return;
    }
    createMonitoredItems( item, TimestampsToReturn.Both, subscription, g_session[0] );

    // call Publish on the OLD session to make sure the subscription is alive
    var session1Publish = new Publish( g_session[0] );
    wait( subscription.RevisedPublishingInterval );
    session1Publish.Execute();
    AssertTrue( session1Publish.CurrentlyContainsData(), "Expected to receive the initial dataChanges for the subscription." );

    // Transfer the above subscription to the second session
    var tsHelper = new transferSubscriptionsHelper( g_session[0], g_session[1], [ subscription ] );
    tsHelper.Request.SendInitialValues = true;
    if( tsHelper.ExecuteAndValidate() )
    {
        // call Publish on the OLD session and make sure that we:
        //  (a) Receive a StatusChange notification
        //  (b) DON'T receive a DataChange notification
        wait( subscription.RevisedPublishingInterval );
        session1Publish.Execute();
        AssertFalse( session1Publish.CurrentlyContainsData(), "Did NOT expect to receive a DataChange notification in the OLD session since the subscription was moved to a new session." );
        AssertGreaterThan( 0, session1Publish.ReceivedStatusChanges.length, "Expected to receive a StatusChange notification that our Subscription was moved from our session." );

        // Delete the subscription as was attached to the first session - we EXPECT THIS TO FAIL!
        var deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
        var deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
        g_session[0].buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

        deleteSubscriptionRequest.SubscriptionIds[0] = subscription.SubscriptionId;

        var uaStatus = g_session[0].deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
        if( uaStatus.isGood() )
        {
            var ExpectedOperationResultsArray = [];
            ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
            checkDeleteSubscriptionsError( deleteSubscriptionRequest, deleteSubscriptionResponse, ExpectedOperationResultsArray );

            // Verify that the subscription isn't deleted from the second session!
            // We will do this by calling ModifySubscription on the second session. This
            // call should succeed.
            var modifySubscriptionRequest = new UaModifySubscriptionRequest();
            var modifySubscriptionResponse = new UaModifySubscriptionResponse();
            g_session[1].buildRequestHeader( modifySubscriptionRequest.RequestHeader );

            modifySubscriptionRequest.MaxNotificationsPerPublish = 1;
            modifySubscriptionRequest.SubscriptionId = subscription.SubscriptionId;

            uaStatus = g_session[1].modifySubscription( modifySubscriptionRequest, modifySubscriptionResponse );
            if( uaStatus.isGood() )
            {
                checkModifySubscriptionValidParameter( modifySubscriptionRequest, modifySubscriptionResponse );
                // delete subscription added above
                deleteSubscription( subscription, g_session[1] );
            }
            else
            {
                addError( "ModifySubscription() status " + uaStatus, uaStatus );
            }
            // clean-up
            modifySubscriptionResponse = null;
            modifySubscriptionRequest = null;
            ExpectedOperationResultsArray = null;
        }
        // clean-up
        uaStatus = null;
        deleteSubscriptionResponse = null;
        deleteSubscriptionRequest = null;
    }
    else
    {
        // delete subscription added above
        deleteSubscription( subscription, g_session[0] );
    }
    // clean-up
    tsHelper = null;
    session1Publish = null;
    item = null;
    nodeSetting = null;
    subscription = null;
}

safelyInvoke( deleteSubscription5106Err007 );