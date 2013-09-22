/*    Test 5.9.4 Test 10 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
            Specify a valid SubscriptionId (subscription created with default parameters),
            TriggeringItemId (MonitoringMode is reporting) and one valid LinksToAdd (mode is reporting).
            Call Publish; Write a value to the triggeringItem. Call Publish.
            Write another value to the triggering item and then call Publish.
            Write values to the linked (triggered) items only and then call Publish.
            Write to the triggering item and then call Publish.
            Note: the nodes for the linked items should be static and not dynamic.
      Expected Results:
            All service and operation level results are Good.
            The 1st Publish call yields data for all of the items.
            The 2nd Publish call yields data for the triggering Item only.
            The 3rd Publish call yields data for the triggering item only.
            The 4th Publish call yields a dataChange for the linked items only.
            The 5th Publish call yields a dataChange for the triggering item only.

      Revision History:
        Oct-21-2009 NP: Initial version.
        Nov-24-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support triggering.
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
        Jun-21-2010 NP: Revised to meet new test-case requirements.
*/

function setTriggering594010()
{
    var triggeringItemSetting = NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "i" );
    var linkedItemSetting = NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "u" );
    if( triggeringItemSetting == null || linkedItemSetting == null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }

    // create the monitoredItems
    var triggeringItem = MonitoredItem.fromSetting( triggeringItemSetting.name, 0, Attribute.Value, "", MonitoringMode.Reporting, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItem  = MonitoredItem.fromSetting( linkedItemSetting.name,     1, Attribute.Value, "", MonitoringMode.Reporting, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    if( triggeringItem == null || addLinkedItem == null )
    {
        addWarning( "Test aborted. Settings not correct. Check: '" + TRIGGERINGITEM_SETTING + "' and '" + TRIGGEREDITEM1_SETTING + "'" );
        return;
    }

    if( !MonitorTriggeringSubscription.SubscriptionCreated )
    {
        addError( "Subscription for conformance unit Monitor Value Change was not created." );
        return;
    }

    // read the items first, then we can set new values for them reliably, i.e. value += 1
    addLog( "Reading the triggering and linked items first to obtain their current value." );
    ReadHelper.Execute( [triggeringItem, addLinkedItem] );

    // function createMonitoredItems( MonitoredItems, TimestampsToReturn, Subscription, Session, ExpectedResults, ExpectErrorNotFail )
    if( createMonitoredItems( [triggeringItem, addLinkedItem], TimestampsToReturn.Both, MonitorTriggeringSubscription, g_session ) )
    {
        // set-up the triggering service call
        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, addLinkedItem ) )
        {
            // First Publish call, expects to receive all items
            addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling 1st Publish..." );
            wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange for ALL items (triggering and linked)." ) )
            {
                AssertEqual( 2, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 2 data changes only! 1 x Triggering item and 1 x Linked items." );
                AssertTrue ( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "Expected 1st Publish call to yield data changes for all items. TRIGGERING item not found!" );
                AssertTrue ( PublishHelper.HandleIsInCurrentDataChanges(  addLinkedItem.ClientHandle ), "Expected 1st Publish call to yield data changes for all items. LINKED item '" + addLinkedItem.NodeSetting + "' not found!" );
            }

            // write to TRIGGERING item and call 2nd Publish. We do this twice.
            for( var r=0; r<2; r++ )
            {
                triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, NodeIdSettings.guessType( triggeringItem.NodeSetting ) );
                if( AssertTrue( WriteHelper.Execute( triggeringItem ), "Writes are needed in order to test the trigger." ) )
                {
                    // 2nd Publish and we expect to receive triggering item ONLY
                    addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling 2nd/3rd Publish..." );
                    wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                    PublishHelper.Execute();
                    if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange for ALL items (triggering and linked)." ) )
                    {
                        AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 data changes only! 1 x Triggering item." );
                        AssertTrue ( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "TRIGGERING item not found!" );
                    }
                }
            }
            
            // now change the linked item values only and then call publish for 4th time
            addLinkedItem.SafelySetValueTypeKnown( addLinkedItem.Value.Value + 1, NodeIdSettings.guessType( addLinkedItem.NodeSetting ) );
            if( AssertTrue( WriteHelper.Execute( addLinkedItem ), "Writes are needed in order to test the linked item." ) )
            {
                // 2nd Publish and we expect to receive triggering item ONLY
                addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling 4th Publish..." );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                PublishHelper.Execute();
                if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange for ALL items (triggering and linked)." ) )
                {
                    AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 data changes only! 1 x Linked item." );
                    AssertTrue ( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItem.ClientHandle ), "Linked item not found!" );
                }
            }

            // now to write to the triggering item and call Publish for 5th time
            triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, NodeIdSettings.guessType( triggeringItem.NodeSetting ) );
            if( AssertTrue( WriteHelper.Execute( triggeringItem ), "Writes are needed in order to test the trigger." ) )
            {
                // 5th Publish and we expect to receive triggering item ONLY
                addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling 2nd/3rd Publish..." );
                wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                PublishHelper.Execute();
                if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange for ALL items (triggering and linked)." ) )
                {
                    AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 data changes only! 1 x Triggering item." );
                    AssertTrue ( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "TRIGGERING item not found!" );
                }
            }
        }// setTriggering.Execute()
    }
    else
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
    }

    // clean-up
    deleteMonitoredItems( [triggeringItem, addLinkedItem], MonitorTriggeringSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( setTriggering594010 );