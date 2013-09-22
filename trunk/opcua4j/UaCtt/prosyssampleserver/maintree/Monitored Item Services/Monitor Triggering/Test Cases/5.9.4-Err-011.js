/*    Test 5.9.4 Error Test 11 prepared by Anand Taparia; ataparia@kepware.com
      Description:
          Script specifies items from different subscriptions for triggeringItemId and linksToRemove[].
          The subscriptionID used for triggering is of the subscription that the triggeringItemId belongs to.

      Revision History:
        Oct-05-2009 AT: Initial version.
        Nov-25-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support Triggering!
*/

function setTriggering594Err011()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
    if( items == null || items.length < 2 )
    {
        addSkipped( "Static Scalar settings." );
        return;
    }

    // We already have one subscription created in the initialize routine. Lets's
    // create the second one here
    SecondSubscription = new Subscription();
    if( !createSubscription( SecondSubscription, g_session ) )
    {
        return;
    }

    // Just for clarity
    var FirstSubscription = MonitorTriggeringSubscription;

    if( !FirstSubscription.SubscriptionCreated || !SecondSubscription.SubscriptionCreated )
    {
        addError( "One or both subscriptions for conformance unit Monitor Triggering was not created.", uaStatus );
        return;
    }

    // add 1 item (will be used as triggeringItemId) to the first subscription
    var createMonitoredItemsRequestFirstSub = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponseFirstSub = new UaCreateMonitoredItemsResponse();
    g_session.buildRequestHeader( createMonitoredItemsRequestFirstSub.RequestHeader );

    createMonitoredItemsRequestFirstSub.SubscriptionId = FirstSubscription.SubscriptionId;
    createMonitoredItemsRequestFirstSub.TimestampsToReturn = TimestampsToReturn.Both;

    createMonitoredItemsRequestFirstSub.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
    createMonitoredItemsRequestFirstSub.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
    createMonitoredItemsRequestFirstSub.ItemsToCreate[0].RequestedParameters.ClientHandle = 0;
    createMonitoredItemsRequestFirstSub.ItemsToCreate[0].RequestedParameters.SamplingInterval = SAMPLING_RATE_FASTEST;
    createMonitoredItemsRequestFirstSub.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
    createMonitoredItemsRequestFirstSub.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;
    createMonitoredItemsRequestFirstSub.ItemsToCreate[0].ItemToMonitor.NodeId = items[0].NodeId;
    createMonitoredItemsRequestFirstSub.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;

    var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequestFirstSub, createMonitoredItemsResponseFirstSub );
    if ( !uaStatus.isGood() )
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
    }
    
    if ( !checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequestFirstSub, createMonitoredItemsResponseFirstSub ) )
    {
        addError( "Unable to validate parameters when creating monitoring items for the first subscription. Stopping test.", uaStatus );
    }

    // Now add 1 item (will be used as linksToAdd[]) to the second subscription
    var createMonitoredItemsRequestSecondSub = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponseSecondSub = new UaCreateMonitoredItemsResponse();
    g_session.buildRequestHeader( createMonitoredItemsRequestSecondSub.RequestHeader );

    createMonitoredItemsRequestSecondSub.SubscriptionId = SecondSubscription.SubscriptionId;
    createMonitoredItemsResponseSecondSub.TimestampsToReturn = TimestampsToReturn.Both;

    createMonitoredItemsRequestSecondSub.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
    createMonitoredItemsRequestSecondSub.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
    createMonitoredItemsRequestSecondSub.ItemsToCreate[0].RequestedParameters.ClientHandle = 0;
    createMonitoredItemsRequestSecondSub.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
    createMonitoredItemsRequestSecondSub.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
    createMonitoredItemsRequestSecondSub.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;
    createMonitoredItemsRequestSecondSub.ItemsToCreate[0].ItemToMonitor.NodeId = items[1].NodeId;
    createMonitoredItemsRequestSecondSub.ItemsToCreate[0].MonitoringMode = MonitoringMode.Sampling;

    var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequestSecondSub, createMonitoredItemsResponseSecondSub );
    if ( !uaStatus.isGood() )
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
    }

    if ( !checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequestSecondSub, createMonitoredItemsResponseSecondSub ) )
    {
        addError( "Unable to validate parameters when creating monitoring items for the second subscription. Stopping test.", uaStatus );
    }

    // Remove link here
    var setTriggeringRequestToRemove = new UaSetTriggeringRequest();
    var setTriggeringResponseToRemove = new UaSetTriggeringResponse();
    g_session.buildRequestHeader( setTriggeringRequestToRemove.RequestHeader );

    // Trigggering item from the first subscription
    setTriggeringRequestToRemove.TriggeringItemId = createMonitoredItemsResponseFirstSub.Results[0].MonitoredItemId;
    // First subscription's subscriptionID as per the test requirement
    setTriggeringRequestToRemove.SubscriptionId = FirstSubscription.SubscriptionId;
    
    // linksToRemove[] from the second subscription
    setTriggeringRequestToRemove.LinksToRemove[0] = createMonitoredItemsResponseSecondSub.Results[0].MonitoredItemId + 0x1234;

    uaStatus = g_session.setTriggering( setTriggeringRequestToRemove, setTriggeringResponseToRemove);
    if( !uaStatus.isGood() )
    {
        addError( "SetTriggering() status " + uaStatus, uaStatus );
    }

    var ExpectedOperationResultsAdd = new Array(0);
    var ExpectedOperationResultsRemove = [ new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid ) ];
    checkSetTriggeringError( setTriggeringRequestToRemove, setTriggeringResponseToRemove, ExpectedOperationResultsAdd, ExpectedOperationResultsRemove );

    // Cleanup
    // Delete the item we added to the first subscription
    var monitoredItemsIdsToDelete = new UaUInt32s();
    monitoredItemsIdsToDelete[0] = createMonitoredItemsResponseFirstSub.Results[0].MonitoredItemId;
    deleteMonitoredItems( monitoredItemsIdsToDelete, FirstSubscription, g_session );

    // Delete the item we added to the second subscription
    monitoredItemsIdsToDelete[0] = createMonitoredItemsResponseSecondSub.Results[0].MonitoredItemId;
    deleteMonitoredItems( monitoredItemsIdsToDelete, SecondSubscription, g_session );

    // Delete the second subscription (first subscription will be deleted in the common cleanup code)
    deleteSubscription( SecondSubscription, g_session );
}

safelyInvoke( setTriggering594Err011 );