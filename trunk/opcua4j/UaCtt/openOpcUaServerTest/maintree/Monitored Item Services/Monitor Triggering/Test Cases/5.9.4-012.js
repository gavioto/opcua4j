/*    Test 5.9.4 Test 12 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
        Create a triggering item whose MonitoringMode is Reporting. Specify the one item in LinksToAdd (mode=reporting) and LinksToDelete, the item is the SAME item for both parameters.
        Call Publish. Write a value to the triggering item and call Publish.
      Expected Results:
        Service result = “Good”. Operation level result is “Good”.
        The 1st Publish yields a dataChange for both items.
        The 2nd Publish yields a dataChange for the triggering item.

      Revision History:
        Oct-21-2009 NP: Initial version.
        Nov-25-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support Triggering!
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
        Jun-21-2010 NP: Revised to meet new test-case requirements.
        Jul-19-2010 NP: Revised to meet new test-case requirements of an op-level fail for the DeleteResults[0]=BadMonitoredItemIdInvalid.
*/

function setTriggering594012()
{
    const TRIGGERINGITEM_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32";
    const TRIGGEREDITEM1_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32";

    // create the monitoredItems
    var triggeringItem   = MonitoredItem.fromSetting( TRIGGERINGITEM_SETTING, 0, Attribute.Value, "", MonitoringMode.Reporting, true, undefined, 1, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItem    = MonitoredItem.fromSetting( TRIGGEREDITEM1_SETTING, 1, Attribute.Value, "", MonitoringMode.Reporting, true, undefined, 1, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var deleteLinkedItem = addLinkedItem;
    if( triggeringItem == null || addLinkedItem == null || deleteLinkedItem == null )
    {
        addSkipped( "Static Scalar (UInt32, Float)" );
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

        // set-up the triggering service call
        var expectedResultsAdd    = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
        var expectedResultsDelete = [ new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid ) ];
        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, addLinkedItem, deleteLinkedItem, true, expectedResultsAdd, expectedResultsDelete ) )
        {
            // publish #1
            addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #1." );
            wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a data-change for both items since the trigger is now invalidated and both itemns should be operating as normal." ) )
            {
                AssertEqual( 2, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 2 notifications since the trigger should be 'empty'." );
                AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "Did not find TRIGGERING item '" + triggeringItem.NodeSetting + "' in Publish response (mode=Reporting)." );
                AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItem.ClientHandle ),  "Did not find LINKED item '" + addLinkedItem.NodeSetting  + "' in Publish response (mode=Sampling)." );
            }
            addLog( "Publish 1 received and checked for both triggering and linked node." );

            // write to the triggeringItem and call Publish, expect Trigger only
            triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
            AssertTrue( WriteHelper.Execute( triggeringItem ), "Expected write to succeed in order to test triggering." );

            // publish #2
            addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #2." );
            wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a data-change for both items since the trigger is now invalidated and both itemns should be operating as normal." ) )
            {
                AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 notifications: 1 x triggering item." );
                AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "Did not find TRIGGERING item '" + triggeringItem.NodeSetting + "' in Publish response (mode=Reporting)." );
            }
            addLog( "Publish 2 received and checked for triggering only." );

            // write to all items and call Publish, expect all items in publish
            triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
            addLinkedItem.SafelySetValueTypeKnown (  addLinkedItem.Value.Value + 1,  addLinkedItem.DataType );
            AssertTrue( WriteHelper.Execute( [ triggeringItem, addLinkedItem ] ), "Expected write to succeed in order to test triggering." );
            // publish #3
            addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + "' msecs before calling Publish #2." );
            wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            addLog( "Checking if Publish #3 yielded 2 dataChanges (trigger + linked). Actually received: " + PublishHelper.CurrentDataChanges[0].MonitoredItems.length );
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a data-change for both items." ) )
            {
                AssertEqual( 2, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 notifications: 1 x triggering item." );
                AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "Did not find TRIGGERING item '" + triggeringItem.NodeSetting + "' in Publish response (mode=Reporting)." );
                AssertTrue( PublishHelper.HandleIsInCurrentDataChanges(  addLinkedItem.ClientHandle ), "Did not find LINKED item '" + addLinkedItem.NodeSetting + "' in Publish response (mode=Reporting)." );
            }
            addLog( "Publish 3 received and checked for triggering and linked items." );
        }// setTriggering.Execute()
    }
    // clean-up
    deleteMonitoredItems( [triggeringItem, addLinkedItem], MonitorTriggeringSubscription, g_session );
}

safelyInvoke( setTriggering594012 );