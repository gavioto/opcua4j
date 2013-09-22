/*    Test 5.9.4 Test 18 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
        Specify a valid SubscriptionId (subscription created with default parameters),
        TriggeringItemId (MonitoringMode is disabled). Specify an item (monitoring the same NodeId
        as the triggering item) in the linksToAdd, and it is Reporting and call Publish; Write a
        value to the triggeringItem and call Publish. Write a value to the linked item and call Publish.

      Expected Results:
        All service and operation level results are Good. ALL Publish calls yield a value of the linked item.

      Revision History:
        Oct-21-2009 NP: Initial version.
        Nov-25-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support Triggering!
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
        Jun-25-2010 NP: Revised to meet new test-case requirements.
*/

function setTriggering594018()
{
    var triggeringItemSetting = NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "dui" ).name;

    // create the monitoredItems
    var triggeringItem = MonitoredItem.fromSetting( triggeringItemSetting, 0, Attribute.Value, "", MonitoringMode.Disabled,  true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItem  = MonitoredItem.fromSetting( triggeringItemSetting, 1, Attribute.Value, "", MonitoringMode.Reporting, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    if( triggeringItem == null || addLinkedItem == null )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    if( !MonitorTriggeringSubscription.SubscriptionCreated )
    {
        addError( "Subscription for conformance unit Monitor Value Change was not created." );
        return;
    }

    // the triggering item is Disabled
    triggeringItem.MonitoringMode = MonitoringMode.Disabled;

    // function createMonitoredItems( MonitoredItems, TimestampsToReturn, Subscription, Session, ExpectedResults, ExpectErrorNotFail )
    if( createMonitoredItems( [triggeringItem, addLinkedItem], TimestampsToReturn.Both, MonitorTriggeringSubscription, g_session ) )
    {
        // set-up the triggering service call
        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, addLinkedItem ) )
        {
            // read the triggeringItem value, and then we'll increment it.
            if( ReadHelper.Execute( triggeringItem ) )
            {
                // call Publish, we expect one datachange for the linked item
                // wait one publishing cycle before calling publish
                addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling Publish (1st time - expecting data change for the linked item!" );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                if( PublishHelper.Execute() )
                {
                    AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a data change for the linked item." );
                    AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItem.ClientHandle ), "Expected 1st Publish call to yield data change for the linked item." );
                }// publish.Execute()

                // write to the triggeringItem
                triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
                if( WriteHelper.Execute( triggeringItem ) )
                {
                    // wait one publishing cycle before calling publish
                    addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling Publish (3rd time) - expecting no data even though we previously wrote to the Triggering item!" );
                    wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                    // call Publish() and see what we receive....
                    if( PublishHelper.Execute() )
                    {
                        AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a data change for the linked item." );
                        AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItem.ClientHandle ), "Expected 2nd Publish call to yield data change for the linked item." );
                    }// publish.Execute()
                }// write.Execute()
            }// read
        }// setTriggering.Execute()
    }
    // clean-up
    deleteMonitoredItems( [triggeringItem, addLinkedItem], MonitorTriggeringSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( setTriggering594018 );