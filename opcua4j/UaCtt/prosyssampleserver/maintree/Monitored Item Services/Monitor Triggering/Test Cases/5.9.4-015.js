/*    Test 5.9.4 Test 15 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
        Specify a valid SubscriptionId (subscription created with default parameters),
        TriggeringItemId (MonitoringMode is sampling). Specify an item (monitoring the same
        NodeId as the triggering item) in the linksToAdd, and it is reporting.
        Call Publish. Write a value to the triggeringItem and call Publish. Call Publish again.
        Write a value to the all items and call Publish.
        Note: This is essentially an over-complicated subscription!
      Expected Results:
        All service and operation level results are Good.
        The 1st Publish yields data for all items.
        The 2nd Publish yields a keep-alive.
        The 3rd Publish call yields a keep-alive.
        The 4th Publish call yields data for the linked item.

      Revision History:
        Oct-21-2009 NP: Initial version.
        Nov-25-2009 NP: REVIEWED/INCONCLUSIVE. UA Server doesn't support triggering.
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
        Jun-22-2010 NP: Revised to match new test-case requirements.
        Jul-09-2010 NP: Added additional Publish call/check per new test-case requirements.
*/

function setTriggering594015()
{
    const NODE_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32";
    // create the monitoredItems
    var triggeringItem = MonitoredItem.fromSetting( NODE_SETTING, 0, Attribute.Value, "", MonitoringMode.Sampling,  true, undefined, 1, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItem  = MonitoredItem.fromSetting( NODE_SETTING, 1, Attribute.Value, "", MonitoringMode.Reporting, true, undefined, 1, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    if( triggeringItem == null || addLinkedItem == null )
    {
        _dataTypeUnavailable.store( "Int32" );
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
        // read all items so that we can get their current values
        addLog( "Reading the triggering and linked items first to obtain their current value." );
        ReadHelper.Execute( [triggeringItem, addLinkedItem] );

        // set-up the triggering service call
        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, addLinkedItem ) )
        {
            // Publish #1 - expecting all items returned
            // wait one publishing cycle before calling publish
            addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling Publish (first time)." );
            wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected First Publish to yield no data-changes for any items." ) )
            {
                AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 notifications: 1 x linked." );
                AssertTrue( PublishHelper.HandleIsInCurrentDataChanges(  addLinkedItem.ClientHandle ), "Did not find LINKED item '" + addLinkedItem.NodeSetting + "' in Publish response (mode=Reporting)." );
            }

            // Publish #2 - write to trigger first
            addLinkedItem.SafelySetValueTypeKnown( addLinkedItem.Value.Value + 1, addLinkedItem.DataType );
            if( WriteHelper.Execute( addLinkedItem ) )
            {
                // wait one publishing cycle before calling publish
                addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #2." );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                // call Publish() and see what we receive....
                PublishHelper.Execute();
                if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a data change for the linked item (because it is mapped to the same NodeId as the triggering item)." ) )
                {
                    AssertTrue( PublishHelper.HandleIsInCurrentDataChanges(  addLinkedItem.ClientHandle ), "Did not find LINKED item '" + addLinkedItem.NodeSetting + "' in Publish response (mode=Reporting)." );
                }
            }// write.Execute()
            
            // Publish #3 - no changes
            // wait one publishing cycle before calling publish
            addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #3." );
            wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
            // call Publish() and see what we receive....
            PublishHelper.Execute();
            AssertFalse( PublishHelper.CurrentlyContainsData(), "Did NOT expect to receive a dataChange since no values were modified." );
            
            // Publish #4 - write to all items
            triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
            addLinkedItem.SafelySetValueTypeKnown ( addLinkedItem.Value.Value  + 1, addLinkedItem.DataType );
            if( WriteHelper.Execute( [triggeringItem, addLinkedItem] ) )
            {
                // wait one publishing cycle before calling publish
                addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #4." );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                // call Publish() and see what we receive....
                PublishHelper.Execute();
                AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange for the linked item which is REPORTING (not relying on a Trigger)." );
                AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItem.ClientHandle ),  "Did not find LINKED item '" + addLinkedItem.NodeSetting  + "' in Publish response (mode=Reporting)." );
            }// write.Execute()
        }// setTriggering.Execute()
    }
    // clean-up
    deleteMonitoredItems( [triggeringItem, addLinkedItem], MonitorTriggeringSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( setTriggering594015 );