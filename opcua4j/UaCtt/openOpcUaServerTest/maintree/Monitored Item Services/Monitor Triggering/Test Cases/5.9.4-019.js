/*    Test 5.9.4 Test 19 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
            Specify a valid SubscriptionId (subscription created with default parameters), 
            TriggeringItemId (MonitoringMode is disabled) and one valid LinksToAdd (items 
            are disabled).

            Write a value to the triggeringItem.
            Call Publish().
                Note: the nodes for the linked items should be static and not dynamic.

      Expected Results:
            All service and operation level results are Good.
            Publish() yields data for triggeringItem only.

      Revision History:
        Oct-21-2009 NP: Initial version.
        Nov-24-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support Triggering.
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
*/

function setTriggering594019()
{
    const TRIGGERINGITEM_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32";
    const TRIGGEREDITEM1_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32";

    // create the monitoredItems
    var triggeringItem = MonitoredItem.fromSetting( TRIGGERINGITEM_SETTING, 0, Attribute.Value, "", MonitoringMode.Disabled, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItem  = MonitoredItem.fromSetting( TRIGGEREDITEM1_SETTING, 1, Attribute.Value, "", MonitoringMode.Disabled, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    if( triggeringItem == null || addLinkedItem == null )
    {
        _dataTypeUnavailable.store( [ "Int32", "UInt32" ] );
        addSkipped( "Static Scalar" );
        return;
    }

    if( !MonitorTriggeringSubscription.SubscriptionCreated )
    {
        addError( "Subscription for conformance unit Monitor Value Change was not created." );
        return;
    }

    // function createMonitoredItems( MonitoredItems, TimestampsToReturn, Subscription, Session, ExpectedResults, ExpectErrorNotFail )
    if( createMonitoredItems( [triggeringItem, addLinkedItem], TimestampsToReturn.Both, MonitorTriggeringSubscription, g_session ) )
    {
        // set-up the triggering service call
        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, addLinkedItem ) )
        {
            // read the triggeringItem value, and then we'll increment it.
            if( ReadHelper.Execute( [triggeringItem, addLinkedItem] ) )
            {
                // call Publish first, we expect a keep alive
                PublishHelper.Execute();
                AssertFalse( PublishHelper.CurrentlyContainsData(), "Expected to receive no data changes since the triggering item is disabled (therefore should not ever trigger!)." );

                // write to the triggeringItem
                triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
                if( WriteHelper.Execute( triggeringItem ) )
                {
                    // wait one publishing cycle before calling publish
                    wait( MonitorTriggeringSubscription.RevisedPublishingInterval );

                    // call Publish first, we expect a keep alive
                    PublishHelper.Execute();
                    AssertFalse( PublishHelper.CurrentlyContainsData(), "Expected to receive no data changes since the triggering item is disabled (therefore should not ever trigger!)." );
                }// write.Execute()
            }
        }// setTriggering.Execute()
    }
    // clean-up
    deleteMonitoredItems( [triggeringItem, addLinkedItem], MonitorTriggeringSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( setTriggering594019 );