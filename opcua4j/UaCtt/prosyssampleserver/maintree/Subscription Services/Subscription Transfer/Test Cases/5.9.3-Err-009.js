/*  Test 5.9.3 Error Test 9 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script sets monitoring mode on a subscription that has been transfered 
        to another session.

    Revision History
        05-Oct-2009 AT: Initial version.
        18-Nov-2009 NP: Revised the logic of the script.
                        REVIEWED/INCONCLUSIVE. OPCF UA Server does not implement TransferSubscriptions.
        18-Dec-2009 DP: Uses library for transferring subscription.
        11-Feb-2011 DP: Fixed script to delete the subscription from the correct session.
        18-Feb-2011 NP: Expect a StatusChange notification on the original session.
*/

function setMonitoringMode593Err009()
{
    var nodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Boolean, "i", "u", "d" ] );
    if( nodeId === undefined || nodeId === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    // We already have one session created in the initialize routine. Lets's
    // create the second one here
    var SecondSession = new UaSession( g_channel );
    if ( !createSession( SecondSession ) )
    {
        addError( "Failed to create second session." );
        return;
    }
    if ( !activateSession( SecondSession ) )
    {
        addError( "Failed to activate second session." );
        return;
    }

    // Just for clarity in this test
    var FirstSession = g_session[0];

    // create a new Subscription for this script
    var testSubscription = new Subscription();
    createSubscription( testSubscription, FirstSession );    

    // Remember MonitorBasicSubscription was created on the first session
    // Add 1 monitored items using default parameters to MonitorBasicSubscription 
    addLog ( "STEP 1: Creating a single monitored item inside the subscription belonging to the first session." );
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    FirstSession.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

    createMonitoredItemsRequest.SubscriptionId = testSubscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

    createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
    createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = nodeId.id;

    var uaStatus = FirstSession.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
    if ( !uaStatus.isGood() )
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        return;
    }

    checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );
    addLog( "Monitored item successfully created." );

    // lets call Publish on this (original) session to make sure the subscription is alive.
    var session1Publish = new Publish( FirstSession );
    wait( testSubscription.RevisedPublishingInterval );
    session1Publish.Execute();
    AssertTrue( session1Publish.CurrentlyContainsData(), "Expected to receive a DataChange on the subscription." );

    // Now transfer MonitorBasicSubscription to the second session
    addLog ( "STEP 2: Transferring the subscription from the first session to the second session." );
    var tsHelper = new transferSubscriptionsHelper( FirstSession, SecondSession, [ testSubscription ] );
    tsHelper.Request.SendInitialValues = true;
    if( !tsHelper.ExecuteAndValidate() )
    {
        // The TRANSFER call FAILED!
        // Clean up and Delete the items we added in this test
        monitoredItemsIdsToDelete = new UaUInt32s();
        for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
        {
            monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
        }
        deleteMonitoredItems( monitoredItemsIdsToDelete, testSubscription, FirstSession );
        closeSession( SecondSession );
    }
    else
    {
        // call Publish on the original session to make sure that we received a 
        // statusChange notification
        wait( testSubscription.RevisedPublishingInterval );
        session1Publish.Execute();
        AssertFalse( session1Publish.CurrentlyContainsData(), "Did NOT expect to receive a dataChange notification on the old session." );
        AssertGreaterThan( 0, session1Publish.ReceivedStatusChanges.length, "Expected to receive a StatusChange notification on the old session to indicate that the subscription was moved." );

        // SetMonitorMode on the subscription as was atttached to the first session.
        addLog ( "STEP 3: Calling SetMonitorMode on the subscription assuming it is still attached to the first session." );

        var setMonitoringModeRequest = new UaSetMonitoringModeRequest ();
        var setMonitoringModeResponse = new UaSetMonitoringModeResponse();
        FirstSession.buildRequestHeader( setMonitoringModeRequest.RequestHeader );

        setMonitoringModeRequest.MonitoringMode = MonitoringMode.Disabled;
        setMonitoringModeRequest.SubscriptionId = testSubscription.SubscriptionId;    
        setMonitoringModeRequest.MonitoredItemIds[0] = createMonitoredItemsResponse.Results[0].MonitoredItemId;

        uaStatus = FirstSession.setMonitoringMode( setMonitoringModeRequest, setMonitoringModeResponse );    
        if( !uaStatus.isGood() )
        {
            addError( "SetMonitoringMode() status " + uaStatus, uaStatus );
        }
        else
        {
            var ExpectedOperationResult = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
            checkSetMonitoringModeFailed ( setMonitoringModeRequest, setMonitoringModeResponse, ExpectedOperationResult );

            // Clean up
            // Delete the items we added in this test
            monitoredItemsIdsToDelete = new UaUInt32s();
            for( i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
            {
                monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
            }
            deleteMonitoredItems( monitoredItemsIdsToDelete, testSubscription, SecondSession );

            // At this point our subscription has been transfered to the second session. 
            // We will do a simple hack here such that the common cleanup code (cleanup.js) will delete
            // our subscription from the second session as well as close the second session.
            g_session[0] = SecondSession;
            // We will have to close the first session here
            closeSession( FirstSession );

            // clean-up
            ExpectedOperationResult = null;
        }
        // clean-up
        setMonitoringModeRequest = null;
        setMonitoringModeResponse = null;
    }
    // clean-up
    deleteSubscription( testSubscription, g_session[0] );
    tsHelper = null;
    session1Publish = null;
    uaStatus = null;
    createMonitoredItemsRequest = null;
    createMonitoredItemsResponse = null;
    testSubscription = null;
    FirstSession = null;
    SecondSession = null;
    nodeId = null;
}

safelyInvoke( setMonitoringMode593Err009 );