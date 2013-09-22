/*    Test 5.9.4 Test 17 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
            Specify a valid SubscriptionId (subscription created with default parameters), TriggeringItemId
            (MonitoringMode is disabled) and multiple valid LinksToAdd (2 items are sampling and 2 are disabled).
            Call Publish. Write a value to the triggeringItem only and call Publish.
            Write a value to 1xsampling and 1xdisabled linked nodes and then call Publish.

      Expected Results:
            All service and operation level results are Good. ALL Publish calls yield a Keep alive.

      Revision History:
        Oct-21-2009 NP: Initial version.
        Nov-24-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support Triggering.
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
        Jun-25-2010 NP: Revised to meet new test-case requirements.
*/

function setTriggering594017()
{
    const TRIGGERINGITEM_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32";
    const TRIGGEREDITEM_SETTINGS = [
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Float",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32"
        ];

    // create the monitoredItems
    var triggeringItem = MonitoredItem.fromSetting ( TRIGGERINGITEM_SETTING, 0, Attribute.Value, "", MonitoringMode.Disabled,  true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItems = MonitoredItem.fromSettings( TRIGGEREDITEM_SETTINGS, 1, Attribute.Value, "", MonitoringMode.Reporting, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    if( triggeringItem == null || addLinkedItems == null || addLinkedItems.length < 4 )
    {
        addSkipped( "Static Scalar (Int16, UInt16, Int32, UInt32, Float)" );
        return;
    }

    if( !MonitorTriggeringSubscription.SubscriptionCreated )
    {
        addError( "Subscription for conformance unit Monitor Value Change was not created." );
        return;
    }

    addLinkedItems[0].MonitoringMode = MonitoringMode.Disabled;
    addLinkedItems[1].MonitoringMode = MonitoringMode.Disabled;

    // consolidate ALL of the monitoredItems into 1 collection to pass to Create/DeleteMonitoredItems
    var monitoredItems = Array( triggeringItem );
    monitoredItems = monitoredItems.concat( addLinkedItems );

    // function createMonitoredItems( MonitoredItems, TimestampsToReturn, Subscription, Session, ExpectedResults, ExpectErrorNotFail )
    if( createMonitoredItems( monitoredItems, TimestampsToReturn.Both, MonitorTriggeringSubscription, g_session ) )
    {
        // call Publish to get any data changes out of the way
        addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling Publish to get the initial data-changes out of the way (we haven't setup Triggering yet)." );
        wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
        PublishHelper.Execute();

        // set-up the triggering service call
        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, addLinkedItems ) )
        {
            // read the triggeringItem value, and then we'll increment it.
            if( ReadHelper.Execute( monitoredItems ) )
            {
                // call Publish first, we expect a keep alive
                PublishHelper.Execute();
                AssertFalse( PublishHelper.CurrentlyContainsData(), "Expected to receive no data changes since the triggering item is disabled (therefore should not ever trigger!)." );

                // write to the triggeringItem
                triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
                if( WriteHelper.Execute( triggeringItem ) )
                {
                    // wait one publishing cycle before calling publish
                    addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling Publish (2nd time)." );
                    wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                    if( PublishHelper.Execute() )
                    {
                        AssertFalse( PublishHelper.CurrentlyContainsData(), "Expected to receive no data changes since the triggering item is disabled (therefore should not ever trigger!)." );
                    }// publish.Execute()

                    // write to the linked items, 1xsampling and 1xdisabled...
                    addLinkedItems[0].SafelySetValueTypeKnown( addLinkedItems[0].Value.Value + 1, addLinkedItems[0].DataType );                    
                    addLinkedItems[3].SafelySetValueTypeKnown( addLinkedItems[3].Value.Value + 1, addLinkedItems[3].DataType );                    
                    if( WriteHelper.Execute( triggeringItem ) )
                    {
                        addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling Publish (3rd time)." );
                        wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                        if( PublishHelper.Execute() )
                        {
                            AssertFalse( PublishHelper.CurrentlyContainsData(), "Expected to receive no data changes since the triggering item is disabled (therefore should not ever trigger!)." );
                        }// publish.Execute()
                    }
                }// write.Execute()
            }//read.Execute();
        }// setTriggering.Execute()
    }
    // clean-up
    deleteMonitoredItems( monitoredItems, MonitorTriggeringSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( setTriggering594017 );