/*  Test 5.10.6 Error Test 8 prepared by Anand Taparia; ataparia@kepwaare.com
    Description:
        Script deletes multiple subscriptions that have been transferred 
        to other sessions.

    Revision History
        22-Sep-2009 AT: Initial version.
        17-Nov-2009 NP: Reworked some of the logic.
                        REVIEWED/INCONCLUSIVE. Server does not support TransferSubscription.
        07-Dec-2009 DP: Use a library class to transferSubscriptions.
        11-Feb-2011 DP: Changed ModifySubscription request to not minimize the lifetime count.
        18-Feb-2011 NP: Expect a StatusChange notification on the original session.
        08-Mar-2011 DP: Expect a StatusChange notification from each subscription.
*/

function transferSubscription5106Err008()
{
    const SUBSCRIPTIONSTOCREATE = 5;
    var allItems = [];
    var subscriptions = [];
    var subscriptionIdList = new IntegerSet();
    var x;
    var uaStatus;
    var publishingInterval = 500;
    var deleteSubscriptionRequest;
    var deleteSubscriptionResponse;

    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( nodeSetting === undefined || nodeSetting === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }

    // Create subscriptions here
    for( x=0; x<SUBSCRIPTIONSTOCREATE; x++ )
    {
        publishingInterval = publishingInterval * 2;
        subscriptions[x] = new Subscription( publishingInterval, true );
        createSubscription( subscriptions[x], g_session[0] );

        // Add the subscriptionID to our array
        subscriptionIdList.insert( subscriptions[x].SubscriptionId );

        // add a monitoredItem to the subscription
        var item = MonitoredItem.fromSetting( nodeSetting.name, 0 );
        item.ClientHandle = subscriptions[x].SubscriptionId;
        if( !createMonitoredItems( item, TimestampsToReturn.Both, subscriptions[x], g_session[0] ) )
        {
            return;
        }
        allItems.push( item );
    }

    // let's call Publish on the new Subscriptions to make sure that we receive initial dataChanges
    // for BOTH subscriptions.
    var session1Publish = new Publish( g_session[0] );
    wait( subscriptions[0].RevisedPublishingInterval );
    for( x=0; x>SUBSCRIPTIONSTOCREATE; x++ )
    {
        session1Publish.Execute();
        AssertTrue( session1Publish.CurrentlyContainsData(), "Expected the initial dataChange on at least one of the " + SUBSCRIPTIONSTOCREATE + " Subscriptions." );
    }//for x...

    // Transfer the above subscriptions to the second session
    var tsHelper = new transferSubscriptionsHelper( g_session[0], g_session[1], subscriptions );
    tsHelper.Request.SendInitialValues = true;
    if( tsHelper.ExecuteAndValidate() )
    {
        // Call Publish on the OLD session, we don't expect dataChanges but DO EXPECT a statusChange
        wait( subscriptions[0].RevisedPublishingInterval );
        for( x=0; x<subscriptions.length; x++ )
        {
            session1Publish.Execute();
            AssertFalse( session1Publish.CurrentlyContainsData(), "Did not expect to receive a dataChange on the old Session." );
            AssertGreaterThan( 0, session1Publish.ReceivedStatusChanges.length, "Expected a statusChange in the OLD session to inform us that we no longer have the subscription." );
        }
        
        // Delete the subscriptions that were attached to the first session 
        deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
        deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
        g_session[0].buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

        for( x=0; x<SUBSCRIPTIONSTOCREATE; x++ )
        {
            deleteSubscriptionRequest.SubscriptionIds[x] = subscriptionIdList.atIndex(x);
        }

        uaStatus = g_session[0].deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
        if( uaStatus.isGood() )
        {
            // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
            var ExpectedOperationResultsArray = [];
            for( x = 0; x < SUBSCRIPTIONSTOCREATE; x++ )
            {
                ExpectedOperationResultsArray[x] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
            }
            checkDeleteSubscriptionsError( deleteSubscriptionRequest, deleteSubscriptionResponse, ExpectedOperationResultsArray );

            // Verify that the subscriptions aren't deleted from the second session!
            // We will do this by calling ModifySubscription for each subscription on 
            // the second session. Each call should succeed.        
            for( x = 0; x < SUBSCRIPTIONSTOCREATE; x++ )
            {    
                var modifySubscriptionRequest = new UaModifySubscriptionRequest();
                var modifySubscriptionResponse = new UaModifySubscriptionResponse();
                g_session[1].buildRequestHeader( modifySubscriptionRequest.RequestHeader );

                modifySubscriptionRequest.MaxNotificationsPerPublish = 1;
                modifySubscriptionRequest.SubscriptionId = subscriptionIdList.atIndex( x );
                modifySubscriptionRequest.RequestedPublishingInterval = 1000;
                modifySubscriptionRequest.RequestedLifetimeCount = 60;
                modifySubscriptionRequest.RequestedMaxKeepAliveCount = 15;

                uaStatus = g_session[1].modifySubscription( modifySubscriptionRequest, modifySubscriptionResponse );
                if( uaStatus.isGood() )
                {
                    checkModifySubscriptionValidParameter( modifySubscriptionRequest, modifySubscriptionResponse );
                }
                else
                {
                    addError( "ModifySubscription() status " + uaStatus, uaStatus );
                }
                // clean-up
                modifySubscriptionResponse = null;
                modifySubscriptionRequest = null;
            }

            // cleanup the subscriptions etc.
            for( x=0; x<SUBSCRIPTIONSTOCREATE; x++ )
            {
                deleteSubscription( subscriptions[x], g_session[1] );
            }
            ExpectedOperationResultsArray = null;
        }
    }
    else
    {
        // transfer failed, so delete the subscriptions from session #0
        // Delete the subscriptions that were attached to the first session 
        deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
        deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
        g_session[0].buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

        for( x = 0; x < SUBSCRIPTIONSTOCREATE; x++ )
        {
            deleteSubscriptionRequest.SubscriptionIds[x] = subscriptionIdList.atIndex(x);
        }

        uaStatus = g_session[0].deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
    }
    // clean-up
    tsHelper = null;
    session1Publish = null;
    allItems = null;
    subscriptions = null;
    subscriptionIdList = null;
    x = null;
    uaStatus = null;
    publishingInterval = null;
    deleteSubscriptionRequest = null;
    deleteSubscriptionResponse = null;
    nodeSetting = null;
}

safelyInvoke( transferSubscription5106Err008 );