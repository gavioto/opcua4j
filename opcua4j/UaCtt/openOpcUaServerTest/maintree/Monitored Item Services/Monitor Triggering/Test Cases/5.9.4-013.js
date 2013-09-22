/*    Test 5.9.4 Test 13 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
            Specify a valid SubscriptionId (subscription created with default parameters),
            TriggeringItemId (MonitoringMode is sampling) and one LinksToAdd (items are sampling).
            Call Publish. Write a value to the triggeringItem and call Publish.
            Write a value to the linked item only and call Publish.
            Write a value to the triggeringItem and call Publish.
            Note: the nodes for the linked items should be static and not dynamic.

      Expected Results:
            All service and operation level results are Good.
            The 1st Publish call yields a keep alive because the "current value" of the trigger does not invoke a dataChange.
            The 2nd publish call yields values for the linked item because the triggering item received a new value.
            The 3rd Publish call yields a keep alive.
            The 4th publish call yields values for the linked item.

      Revision History:
        Oct-21-2009 NP: Initial version.
        Nov-24-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support Triggering.
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
        Jun-21-2010 NP: Revised to meet new test-case requirements.
        Mar-11-2011 NP: Corrected expectation to NOT receive data since all items are SAMPLING only. (Credit RA)
        Mar-14-2011 MI: Undo last change. Updated Expected results. See Mantis 1536.
*/

function setTriggering594013()
{
    const TRIGGERINGITEM_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32";
    const TRIGGEREDITEM1_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32";

    // create the monitoredItems
    var triggeringItem = MonitoredItem.fromSetting( TRIGGERINGITEM_SETTING, 0, Attribute.Value, "", MonitoringMode.Sampling, true, undefined, 1, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItem  = MonitoredItem.fromSetting( TRIGGEREDITEM1_SETTING, 1, Attribute.Value, "", MonitoringMode.Sampling, true, undefined, 1, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    if( triggeringItem == null || addLinkedItem == null )
    {
        _dataTypeUnavailable.store( [ "Int32", "UInt32" ] );
        addSkipped( "Static Scalar (Int32, UInt32)" );
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
        // read all items so that we can get their current values
        addLog( "Reading the triggering and linked items first to obtain their current value." );
        ReadHelper.Execute( [addLinkedItem, triggeringItem ] );
        wait( triggeringItem.revisedSamplingInterval );

        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, addLinkedItem ) )
        {
            // Publish #1 - expecting no items returned
            // wait one publishing cycle before calling publish
            addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling Publish." );
            wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            AssertFalse( PublishHelper.CurrentlyContainsData(), "Expected First Publish to yield no data-changes for any items." );

            // Publish #2; write to the triggeringItem
            triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
            if( WriteHelper.Execute( triggeringItem ) )
            {
                // wait one publishing cycle before calling publish
                addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #2." );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                // call Publish() and see what we receive....
                PublishHelper.Execute();
                if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive data for all of the linked items because we previously wrote to the Triggering item." ) )
                {
                    AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 notifications since the trigger was written to and the sampling item should now have a value." );
                    AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItem.ClientHandle ),  "Did not find LINKED item '" + addLinkedItem.NodeSetting  + "' in Publish response (mode=Sampling)." );
                }

            }// write.Execute()
            
            // Publish #3; write to a linked item
            addLinkedItem.SafelySetValueTypeKnown( addLinkedItem.Value.Value + 1, addLinkedItem.DataType );
            if( WriteHelper.Execute( addLinkedItem ) )
            {
                // wait one publishing cycle before calling publish
                addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #3." );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                // call Publish() and see what we receive....
                PublishHelper.Execute();
                AssertFalse( PublishHelper.CurrentlyContainsData(), "Expected to receive a keep-alive since data has NOT changed for the triggering item. Even though we wrote to the linked item, we must wait for the triggering item to change value now." );
            }// write.Execute()
            
            // Publish #4; write to triggering
            triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
            if( WriteHelper.Execute( triggeringItem ) )
            {
                // wait one publishing cycle before calling publish
                addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #4." );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                // call Publish() and see what we receive....
                PublishHelper.Execute();
                if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive data since linked item and triggered item both changed!" ) )
                {
                    AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 notifications: 1 x linked." );
                    AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItem.ClientHandle ), "Did not find LINKED item '" + triggeringItem.NodeSetting + "' in Publish response (mode=Sampling)." );
                }
            }// write.Execute()
        }// setTriggering.Execute()
    }
    // clean-up
    deleteMonitoredItems( [triggeringItem, addLinkedItem], MonitorTriggeringSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( setTriggering594013 );