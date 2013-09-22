/*    Test 5.9.4 Test 16 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
      Description:
            Specify a valid SubscriptionId (subscription created with default parameters), TriggeringItemId
            (MonitoringMode is disabled) and one valid LinksToAdd (mode is sampling).
            Write a value to the triggeringItem. Call Publish.
            Write another value to the all items and then call Publish.

      Expected Results:
            All service and operation level results are Good. ALL Publish calls yield a Keep alive.

      Revision History:
        Oct-21-2009 NP: Initial version.
        Nov-18-2009 NP: REVIEWED/INCONCLUSIVE. OPCF UA Sample Server does not implement SetTriggering.
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
        Jun-25-2010 NP: Rewritten to match new test-case requirements.
*/

function setTriggering594016()
{
    const TRIGGERINGITEM_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32";
    const TRIGGEREDITEM1_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32";

    // create the monitoredItems
    var triggeringItem = MonitoredItem.fromSetting( TRIGGERINGITEM_SETTING, 0, Attribute.Value, "", MonitoringMode.Disabled, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
    var addLinkedItem  = MonitoredItem.fromSetting( TRIGGEREDITEM1_SETTING, 1, Attribute.Value, "", MonitoringMode.Sampling, true, undefined, undefined, SAMPLING_RATE_FASTEST, TimestampsToReturn.Both );
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
        // set-up the triggering service call
        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, triggeringItem, addLinkedItem ) )
        {
            // read the triggeringItem value, and then we'll increment it.
            if( ReadHelper.Execute( [triggeringItem, addLinkedItem] ) )
            {
                // write to the triggeringItem
                triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
                if( WriteHelper.Execute( triggeringItem ) )
                {
                    // wait one publishing cycle before calling publish
                    addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling Publish (first time)." );
                    wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                    // call Publish() and see what we receive....
                    addLog( "Triggering is setup, a value has been written... now calling Publish." );
                    if( PublishHelper.Execute() )
                    {
                        addLog( "Publish called, checking if any data was received. Data Received? " + ( PublishHelper.CurrentlyContainsData() == true ? "Yes - as" : "No - not" ) + " expected!" );
                        AssertFalse( PublishHelper.CurrentlyContainsData(), "Expected 0 dataChange notifications." );
                    }// publish.Execute()

                    // now to write to ALL items and call Publish, still expecting 0 dataChange notifications 
                    triggeringItem.SafelySetValueTypeKnown( triggeringItem.Value.Value + 1, triggeringItem.DataType );
                    addLinkedItem.SafelySetValueTypeKnown( addLinkedItem.Value.Value + 1, addLinkedItem.DataType );
                    if( WriteHelper.Execute( [triggeringItem, addLinkedItem] ) )
                    {
                        addLog( "Waiting '" + MonitorTriggeringSubscription.RevisedPublishingInterval + " msecs' before calling Publish (2nd time)." );
                        wait( MonitorTriggeringSubscription.RevisedPublishingInterval );
                        if( PublishHelper.Execute() )
                        {
                            addLog( "Publish called, checking if any data was received. Data Received? " + ( PublishHelper.CurrentlyContainsData() == true ? "Yes - as" : "No - not" ) + " expected!" );
                            AssertFalse( PublishHelper.CurrentlyContainsData(), "Expected 0 dataChange notifications." );
                        }// publish.Execute()
                    }
                }// write.Execute()
            }//read.Execute()
        }// setTriggering.Execute()
    }
    // clean-up
    deleteMonitoredItems( [triggeringItem, addLinkedItem], MonitorTriggeringSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( setTriggering594016 );