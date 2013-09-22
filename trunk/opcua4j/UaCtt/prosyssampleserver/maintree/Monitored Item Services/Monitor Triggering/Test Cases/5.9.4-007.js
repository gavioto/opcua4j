/*    Test 5.9.4 Test 7 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
        Create an infinite loop, i.e. triggeringItem (reporting) “item1” contains a link to (sampling)
        “item2”; then triggering (sampling) “item2” contains a link to (reporting) “item1”.
        Invoke a write to triggering node: “item1” and call Publish.
        Write to both the triggering and linked Items and call Publish.
        Call Publish again.

      Expected Results:
        All service and operation level results are Good.
        The 1st Publish yields data for both items.
        The 2nd Publish yields data for both items.
        The 3rd Publish yields no data changes.

      Revision History:
        Oct-21-2009 NP: Initial version.
        Nov-25-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support Triggering!
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
        Jun-21-2010 NP: Revised to match new test-case requirements:
*/

function setTriggering594007()
{
    const PUBLISHCOUNT = 5;

    // create the monitoredItems
    var triggeringItemSetting = NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "i" );
    var linkedItemSetting = NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "u" );
    if( triggeringItemSetting == null || linkedItemSetting == null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }

    var triggeringItem   = MonitoredItem.fromSetting( triggeringItemSetting.name, 0, Attribute.Value, "", MonitoringMode.Reporting,true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItem    = MonitoredItem.fromSetting( linkedItemSetting.name,     1, Attribute.Value, "", MonitoringMode.Sampling, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );

    // read the items first, then we can set new values for them reliably, i.e. value += 1
    addLog( "Reading the triggering and linked items first to obtain their current value." );
    ReadHelper.Execute( [triggeringItem, addLinkedItem] );

    // function createMonitoredItems( MonitoredItems, TimestampsToReturn, Subscription, Session, ExpectedResults, ExpectErrorNotFail )
    if( createMonitoredItems( [triggeringItem, addLinkedItem], TimestampsToReturn.Both, MonitorTriggeringSubscription, g_session ) )
    {
        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, addLinkedItem ) )
        {
            // set-up the triggering between Item2 -> Item1 (reverse of the previous)
            if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, addLinkedItem, triggeringItem ) )
            {
                // invoke a write to first triggered item
                triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, NodeIdSettings.guessType( triggeringItem.NodeSetting ) );
                if( AssertTrue ,WriteHelper.Execute( triggeringItem ), "Writes are needed in order to test the trigger." )
                {
                    addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling 1st Publish..." );
                    wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                    // first publish, we expect data for both items
                    PublishHelper.Execute();
                    if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected 1st Publish to yield data." ) )
                    {
                        AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "Expected 1st Publish call to yield data changes for all items. TRIGGERING item not found!" );
                        AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItem.ClientHandle  ), "Expected 1st Publish call to yield data changes for all items. LINKED item not found!" );
                    }
                    addLog( "Publish 1 called, completed check for Triggering and Linked items." );

                    // write to both triggered and linked items
                    triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, NodeIdSettings.guessType( triggeringItem.NodeSetting ) );
                    addLinkedItem.SafelySetValueTypeKnown (  addLinkedItem.Value.Value + 1, NodeIdSettings.guessType( addLinkedItem.NodeSetting ) );
                    AssertTrue( WriteHelper.Execute( [triggeringItem, addLinkedItem] ), "Expected write to succeed." );
                    
                    // second Publish, expected data for both items
                    addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling 2nd Publish..." );
                    wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                    PublishHelper.Execute();
                    if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected 2nd Publish to yield data." ) )
                    {
                        AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( triggeringItem.ClientHandle ), "Expected 2nd Publish call to yield data changes for all items. TRIGGERING item not found!" );
                        AssertTrue( PublishHelper.HandleIsInCurrentDataChanges( addLinkedItem.ClientHandle  ), "Expected 2nd Publish call to yield data changes for all items. LINKED item not found!" );
                    }
                    addLog( "Publish 2 called, completed check for Triggering and Linked items." );

                    // third publish, keep alive!
                    addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling 3rd Publish..." );
                    wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                    PublishHelper.Execute();
                    AssertFalse( PublishHelper.CurrentlyContainsData(), "Expected to receive a keep-alive and NO data since neither the trigger or linked item were updated!" );
                    addLog( "Publish 3 called, completed check for KeepAlive." );
                }//write
            }// setTriggering.Execute() Item2 -> Item1
        }// setTriggering.Execute() Item1 -> Item2
    }
    else
    {
        addError( "CreateMonitoredItems status " + uaStatus, uaStatus );
    }

    // clean-up
    deleteMonitoredItems( [triggeringItem, addLinkedItem], MonitorTriggeringSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( setTriggering594007 );