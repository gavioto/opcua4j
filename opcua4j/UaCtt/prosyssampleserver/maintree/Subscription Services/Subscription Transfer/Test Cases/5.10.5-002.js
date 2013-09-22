/*  Test 5.10.5 Test 2 prepared by Anand Taparia; ataparia@kepwaare.com
    Description:
        Script calls republish after the subscriptions had been transferred 
        to a different session

    Revision History
        21-Sep-2009 AT: Initial version.
        30-Sep-2009 AT: Added handling for cases when subscription/monitored item creation fails.
        01-Oct-2009 AT: Added handling for case when transferSubscriptions fails.
        17-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server does not support TransferSubscription.
        07-Dec-2009 DP: Use a library class to transferSubscriptions.
        11-Feb-2011 DP: Fixed reference to receivedSequenceNumbers.atindex() to use session1Publish.
        18-Feb-2011 NP: Changed expectation that StatusChange will be received on the OLD session.
*/

function republish5105002()
{
    var setting1 = readSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" ).name ).toString();
    var setting2 = readSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting( "udi" ).name ).toString();
    if( setting1 === "" || setting2 === "" )
    {
        addSkipped( "Dynamic Scalar" );
        return;
    }
    // create subscription
    var basicSubscription = new Subscription();
    if ( createSubscription( basicSubscription, g_session[0] ) )
    {
        var i;
        var MonitoredItems = [];
        var clientHandle = 0;
        MonitoredItems[0] = new MonitoredItem( UaNodeId.fromString( setting1 ), clientHandle++ );
        MonitoredItems[1] = new MonitoredItem( UaNodeId.fromString( setting2 ), clientHandle++ );

        if( createMonitoredItems( MonitoredItems, TimestampsToReturn.Both, basicSubscription, g_session [0] ) )
        {
            // wait and call Publish, make sure we receive initial dataChanges
            var session1Publish = new Publish( g_session[0] );
            wait( basicSubscription.RevisedPublishingInterval );
            session1Publish.Execute();
            AssertTrue( session1Publish.CurrentlyContainsData(), "Expected to receive the initial dataChange." );

            // transfer the subscription to another session
            var tsHelper = new transferSubscriptionsHelper( g_session[0], g_session[1], [ basicSubscription ] );
            tsHelper.Request.SendInitialValues = true;

            // Flag to check if the subscription was successfully transferred
            var subscriptionTransferred = false;
            if( tsHelper.ExecuteAndValidate() )
            {
                // make sure the OLD session sees a StatusChange notification
                session1Publish.Execute();
                AssertGreaterThan( 0, session1Publish.ReceivedStatusChanges.length, "Expected to receive a StatusChange notification on the OLD session." );

                subscriptionTransferred = true;

                // call republish with the sequence number received above (on the first session)
                var republishRequest = new UaRepublishRequest();
                var republishResponse = new UaRepublishResponse();
                g_session[0].buildRequestHeader( republishRequest.RequestHeader );

                republishRequest.RetransmitSequenceNumber = session1Publish.ReceivedSequenceNumbers[0];
                republishRequest.SubscriptionId = basicSubscription.SubscriptionId;

                var uaStatus = g_session [0].republish( republishRequest, republishResponse );
                if( uaStatus.isGood() )
                {
                    // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
                    var ExpectedOperationResults = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
                    checkRepublishFailed( republishRequest, republishResponse, ExpectedOperationResults );
                    if( republishResponse.NotificationMessage.NotificationData.length !== 0 )
                    {
                        addError( "Republish: no NotificationData in NotificationMessage was expected!" );
                    }
                }
                else
                {
                    addError( "RePublish() status " + uaStatus, uaStatus );
                }
                // clean-up
                uaStatus = null;
                republishResponse = null;
                republishRequest = null;
            }

            // On cleanup, delete items/subscription from the correct session
            var monitoredItemsIdsToDelete = new UaUInt32s();
            var j = 0;
            for(i = 0; i< MonitoredItems.length; i++)
            {
                monitoredItemsIdsToDelete[j++] = MonitoredItems[i].MonitoredItemId;
            }
            if( subscriptionTransferred )
            {
                deleteMonitoredItems( monitoredItemsIdsToDelete, basicSubscription, g_session[1] );
                // delete the subscription we added here 
                deleteSubscription( basicSubscription, g_session[1] );                
            }
            else
            {
                deleteMonitoredItems( monitoredItemsIdsToDelete, basicSubscription, g_session[0] );
                // delete the subscription we added here 
                deleteSubscription( basicSubscription, g_session[0] );
            }
            // clean-up
            tsHelper = null;
            session1Publish = null;
        }
        // clean-up
        MonitoredItems = null;
    }
    // as a fail-safe, we'll try to delete the subscription from both sessions 
    deleteSubscription( basicSubscription, g_session[1] );                
    deleteSubscription( basicSubscription, g_session[0] );
    //clean-up
    basicSubscription = null;
    setting2 = null;
    setting1 = null;
}

safelyInvoke( republish5105002 );