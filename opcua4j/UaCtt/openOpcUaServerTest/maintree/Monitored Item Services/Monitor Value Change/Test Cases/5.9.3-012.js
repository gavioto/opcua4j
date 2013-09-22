/*  Test 5.9.3 Test 12 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script sets monitoring mode to 'Disabled' for an already 'Disabled' monitor item. 
        Calls publish each time to verify that no notifications were received.

        How this script works:
            1) 1 sessions is created.
            2) 2 subscription are created in the session.
            3) 1 monitoredItem per subscription (monitoringMode = disabled).
            4) setMonitoringMode=1 reporting in session 1's subscription.
            5) call Publish() multiple times.

            We EXPECT that:
                subscription #1 : yields data
                subscription #2 : yields nothing/empty.

    Revision History
        05-Oct-2009 AT: Reworked script based on the revision to the corresponding test case.
        16-Nov-2009 NP: REVIEWED.
        09-Dec-2009 DP: Dynamically select a NodeId setting.
        22-Mar-2010 NP: Added TimeoutHint to the Publish objects.
        30-Apr-2010 NP: BUGFIX: 1 subscription is now created, and global subscription is also used (2 total)
                        Revised script logic to match new test-case requirements.
        17-Jul-2011 NP: Revised test based on new test-case requirements. 2 sessions replaced with 1 session to 
                        account for embedded UA devices etc.
        05-Aug-2011 NP: Corrected some timing issues where tested-server might not be able to respond quickly enough 
                        to satisfy the test-expectations, i.e. missing delays before Publish calls. Improved error messages.
*/

function setMonitoredItems593012()
{
    const MONITOREDITEM_SETTING = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( MONITOREDITEM_SETTING === undefined || MONITOREDITEM_SETTING === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }

    // create a subscription in each session
    var subscription1 = MonitorBasicSubscription;
    var subscription2 = new Subscription();
    if( createSubscription( subscription2, g_session ) == false )
    {
        addError( "2nd Subscription could not be created. Aborting test." );
        return;
    }

    // create the monitoredItem for session #1 and session #2
    var subscription1Item = MonitoredItem.fromSetting( MONITOREDITEM_SETTING.name, 0, Attribute.Value, "", MonitoringMode.Disabled );
    var subscription2Item = MonitoredItem.fromSetting( MONITOREDITEM_SETTING.name, 0, Attribute.Value, "", MonitoringMode.Disabled );

    // add monitoredItems to subscriptions
    if( !createMonitoredItems( subscription1Item, TimestampsToReturn.Both, subscription1, g_session ) )
    {
        return;
    }
    // add monitoredItems to subscriptions
    if( !createMonitoredItems( subscription2Item, TimestampsToReturn.Both, subscription2, g_session ) )
    {
        deleteMonitoredItems( subscription2Item, subscription2, g_session );
        deleteSubscription( subscription2, g_session );
        return;
    }

    // call Publish, make sure we get a keep alive for both
    // we have to 2 call Publish twice, once per subscription. Neither should return a value.
    wait( subscription1.RevisedPublishingInterval );
    PublishHelper.Execute();
    AssertEqual( false, PublishHelper.CurrentlyContainsData(), "Publish() yielded data for an item that is DISABLED!" );

    PublishHelper.Execute();
    AssertEqual( false, PublishHelper.CurrentlyContainsData(), "Publish() yielded data for an item that is DISABLED!" );

    // now to change the monitoringMode to REPORTING in subscription #2.
    addLog( "Modifying the monitoringMode as REPORTING for subscription 2" );
    var subscription2SetMonitoringModeService = new SetMonitoringMode( g_session );
    if( subscription2SetMonitoringModeService.Execute( MonitoringMode.Reporting, subscription2Item, subscription2 ) )
    {
        // wait for at least one sampling interval so as to allow the server some time to poll
        // the data source.
        print( "\t** Wait one RevisedPublishingInterval (" + subscription1Item.RevisedSamplingInterval + " ms) **" );
        wait( subscription2.RevisedPublishingInterval );

        // call Publish, we expect a dataChange for the item that is now reporting 
        // we have 2 subscriptions, so we MIGHT need to call Publish twice, just in case the response comes back 
        // as a keepAlive for the 1st subscription.
        for( var p=0; p<2; p++ )
        {
            PublishHelper.Execute();
            if( PublishHelper.publishResponse.SubscriptionId === subscription2.SubscriptionId )
            {
                break;
            }
            addLog( "** CALLING PUBLISH AGAIN! we received a publish response for the first subscription (Id: " +
                subscription1.SubscriptionId + ") although we're actually waiting for subscription #2." );
        }
        AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange as the disabled item (MonitoredItemId: " + subscription2Item.MonitoredItemId + ") in Subscription #2 (SubscriptionId: " + subscription2.SubscriptionId + ") was changed to reporting." );

        // call Publish several times and verify that no more data is received because: 
        //  a.) one item in its own subscription is DISABLED.
        //  b.) the other item that is REPORTING is static and therefor not changing value.
        for( var i=0; i<10; i++ )
        {
            PublishHelper.Execute();
            AssertFalse( PublishHelper.CurrentlyContainsData(), "Received an unexpected dataChange! we have a disabled item (MonitoredItem: " + subscription1Item.MonitoredItemId + ") in Subscription #1 (SubscriptionId: " + subscription1.SubscriptionId + ")\r\nand one REPORTING item (MonitoredItemId: " + subscription2Item.MonitoredItemId + ") in Subscription #2 (SubscriptionId: " + subscription2.SubscriptionId + ") although its value should be static and not changing." );
        }//for i
    }

    // CLEAN UP
    subscription2SetMonitoringModeService = null;
    deleteMonitoredItems( subscription1Item, subscription1, g_session );
    deleteMonitoredItems( subscription2Item, subscription2, g_session );
    deleteSubscription( subscription2, g_session );
    PublishHelper.Clear();
}

safelyInvoke( setMonitoredItems593012 );