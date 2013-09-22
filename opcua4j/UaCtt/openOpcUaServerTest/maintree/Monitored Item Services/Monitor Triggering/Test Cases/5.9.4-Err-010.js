/*    Test 5.9.4 Error Test 10 prepared by Anand Taparia; ataparia@kepware.com
      Description:
          Script specifies items from different subscriptions for triggeringItemId and linksToAdd[].
          Create a trigger in Subscription 1, but the links to remove are not defined because they are in subscription #2.

      Revision History:
        Oct-05-2009 AT: Initial version.
        Nov-25-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support Triggering!
*/

function setTriggering594Err010()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
    if( items == null || items.length < 2 )
    {
        addSkipped( "Static Scalar" );
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
        addError( "One or both subscriptions for conformance unit Monitor Triggering was not created." );
        return;
    }

    // add 1 item (will be used as triggeringItemId) to the first subscription
    var triggeringItemSub1 = items[0];
    triggeringItemSub1.SamplingInterval = SAMPLING_RATE_FASTEST;
    triggeringItemSub1.QueueSize = 1;
    triggeringItemSub1.MonitoringMode = MonitoringMode.Reporting;
    // create a clone of triggeringItemSub1 because we will delete triggeringItemSub1 in a moment
    // so as to ensure we have a different monitoredItemId between the items in different subscriptions.
    var triggeringItemSub1Clone = MonitoredItem.Clone( triggeringItemSub1 );

    // create the trigger in subscription1
    if( !createMonitoredItems( [ triggeringItemSub1, triggeringItemSub1Clone ], TimestampsToReturn.Both, FirstSubscription, g_session ) )
    {
        deleteSubscription( SecondSubscription, g_session );    
        return;
    }
    // now delete triggeringItemSub1
    AssertTrue( deleteMonitoredItems( triggeringItemSub1, FirstSubscription, g_session ), "Expected to remove the first item from the subscription without error." );

    // create the next triggering item, for subscription #2
    var triggeringItemSub2 = items[1];
    triggeringItemSub2.SamplingInterval = SAMPLING_RATE_FASTEST;
    triggeringItemSub2.QueueSize = 1;
    triggeringItemSub2.MonitoringMode = MonitoringMode.Reporting;

    var triggeringItemSub2Clone1 = MonitoredItem.Clone( triggeringItemSub2 );
    var triggeringItemSub2Clone2 = MonitoredItem.Clone( triggeringItemSub2 );

    // create the trigger in subscription2
    if( !createMonitoredItems( [ triggeringItemSub2, triggeringItemSub2Clone1, triggeringItemSub2Clone2 ], TimestampsToReturn.Both, SecondSubscription, g_session ) )
    {
        deleteMonitoredItems( triggeringItemSub1, FirstSubscription, g_session );
        deleteSubscription( SecondSubscription, g_session );
        return;
    }

    // create the trigger in subscription 1 with linked items defined in subscription 1
    var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
    SetTriggeringHelper.Execute( FirstSubscription, triggeringItemSub2Clone2, [ triggeringItemSub1Clone ], null, false, expectedServiceResult );

    // Cleanup
    deleteMonitoredItems( triggeringItemSub1Clone, FirstSubscription, g_session );
    deleteMonitoredItems( [ triggeringItemSub2, triggeringItemSub2Clone1, triggeringItemSub2Clone2 ], SecondSubscription, g_session );
    deleteSubscription( SecondSubscription, g_session );    
}

safelyInvoke( setTriggering594Err010 );