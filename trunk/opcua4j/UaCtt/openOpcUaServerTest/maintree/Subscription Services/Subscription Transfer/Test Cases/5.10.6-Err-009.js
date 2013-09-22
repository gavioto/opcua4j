/*  Test 5.10.6 Error Test 9 prepared by Anand Taparia; ataparia@kepwaare.com
    Description:
        Script deletes multiple subscriptions where some are valid subscriptionIds
        and others have been transferred to other sessions.

    Revision History
        22-Sep-2009 AT: Initial version.
        17-Nov-2009 NP: Reworked some of the logic.
                        REVIEWED/INCONCLUSIVE. Server does not support TransferSubscriptions.
        07-Dec-2009 DP: Use a library class to transferSubscriptions.
        11-Feb-2011 DP: Changed ModifySubscription request to not minimize the lifetime count.
        18-Feb-2011 NP: Expect a StatusChange notification on the original session.
        08-Mar-2011 DP: Expect a StatusChange notification from each subscription.
*/

function transferSubscription5106Err009()
{
    const SUBSCRIPTIONSTOCREATE = 5;
    var subscriptionIdList = new IntegerSet();
    var subscriptions = [];
    var x;
    var transferedSubscriptionIdIndexList = new IntegerSet();
    // Has to be in the range 0 - (SUBSCRIPTIONSTOCREATE - 1)
    transferedSubscriptionIdIndexList.insert( 0 );
    transferedSubscriptionIdIndexList.insert( 2 );
    transferedSubscriptionIdIndexList.insert( 4 );
    var subscriptionsToTransfer = [];
    var publishingInterval = 500;
    var deleteSubscriptionRequest;
    var deleteSubscriptionResponse;
    var uaStatus;

    // Create subscriptions here
    for( x=0; x<SUBSCRIPTIONSTOCREATE; x++)
    {
        publishingInterval *= 2;
        subscriptions[x] = new Subscription( publishingInterval, true );
        createSubscription( subscriptions[x], g_session[0] );
        
        // Add the subscriptionID to our list
        subscriptionIdList.insert( subscriptions[x].SubscriptionId );
    }

    for(x=0; x<transferedSubscriptionIdIndexList.size(); x++ )
    {
        subscriptionsToTransfer.push( subscriptions[transferedSubscriptionIdIndexList.atIndex( x )] );
    }

    // Transfer subscriptions here
    var tsHelper = new transferSubscriptionsHelper( g_session[0], g_session[1], subscriptionsToTransfer );
    tsHelper.Request.SendInitialValues = true;
    if( tsHelper.ExecuteAndValidate() )
    {
        // call Publish 
        // we don't care about dataChanges, we just need to make sure a StatusChange was received.
        wait( subscriptions[0].RevisedPublishingInterval );
        var session1Publish = new Publish( g_session[0] );
        for( x=0; x<transferedSubscriptionIdIndexList.size(); x++)
        {
            session1Publish.Execute();
            AssertGreaterThan( 0, session1Publish.ReceivedStatusChanges.length, "Expected to receive a statusChange notification that one or more subscriptions have been lost." );
        }

        // Now delete all the subscriptions. Some should succeed and some should fail
        deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
        deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
        g_session[0].buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

        for( x=0; x<SUBSCRIPTIONSTOCREATE; x++ )
        {
            deleteSubscriptionRequest.SubscriptionIds[x] = subscriptionIdList.atIndex(x);
        }
        uaStatus = g_session [0].deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
        if( uaStatus.isGood() )
        {
            // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
            var ExpectedOperationResultsArray = [];
            // Set all good first
            for( x=0; x<SUBSCRIPTIONSTOCREATE; x++)
            {
                ExpectedOperationResultsArray[x] = new ExpectedAndAcceptedResults( StatusCode.Good );
            }
            // For the ones that have already been transfered, set the status to Bad_SubscriptionIdInvalid.
            for( x=0; x<transferedSubscriptionIdIndexList.size(); x++ )
            {
                ExpectedOperationResultsArray[transferedSubscriptionIdIndexList.atIndex(x)] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
            }
            checkDeleteSubscriptionsError( deleteSubscriptionRequest, deleteSubscriptionResponse, ExpectedOperationResultsArray );

            // Verify that the subscriptions aren't deleted from the second session!
            // We will do this by calling ModifySubscription for each subscription (that 
            // was transfered) on the second session. Each call should succeed.        
            for( x=0; x<transferedSubscriptionIdIndexList.size(); x++ )
            {
                var modifySubscriptionRequest = new UaModifySubscriptionRequest();
                var modifySubscriptionResponse = new UaModifySubscriptionResponse();
                g_session[1].buildRequestHeader( modifySubscriptionRequest.RequestHeader );

                modifySubscriptionRequest.MaxNotificationsPerPublish = 1;
                modifySubscriptionRequest.SubscriptionId = subscriptionIdList.atIndex( transferedSubscriptionIdIndexList.atIndex( x ) );
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
            }

            // cleanup the subscriptions
            for( x=0; x<transferedSubscriptionIdIndexList.size(); x++ )
            {
                deleteSubscription( subscriptionsToTransfer[transferedSubscriptionIdIndexList.atIndex(x)], g_session[1] );
            }
            ExpectedOperationResultsArray = null;
        }
        else
        {
            addError( "DeleteSubscriptions() status " + uaStatus, uaStatus );
        }
        // clean-up
        session1Publish = null;
    }
    else
    {
        // delete all of the subscriptions
        deleteSubscriptionRequest = new UaDeleteSubscriptionsRequest();
        deleteSubscriptionResponse = new UaDeleteSubscriptionsResponse();
        g_session[0].buildRequestHeader( deleteSubscriptionRequest.RequestHeader );

        for( x=0; x<SUBSCRIPTIONSTOCREATE; x++ )
        {
            deleteSubscriptionRequest.SubscriptionIds[x] = subscriptionIdList.atIndex(x);
        }
        uaStatus = g_session[0].deleteSubscriptions( deleteSubscriptionRequest, deleteSubscriptionResponse );
    }
    // clean-up
    tsHelper = null;
    subscriptionsToTransfer = null;
    publishingInterval = null;
    deleteSubscriptionRequest = null;
    deleteSubscriptionResponse = null;
    uaStatus = null;
    subscriptionIdList = null;
    subscriptions = null;
    transferedSubscriptionIdIndexList = null;
}

safelyInvoke( transferSubscription5106Err009 );