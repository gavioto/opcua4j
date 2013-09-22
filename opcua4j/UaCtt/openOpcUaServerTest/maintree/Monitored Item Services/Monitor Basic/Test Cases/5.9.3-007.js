/*  Test 5.9.3 Test 7 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script sets monitoring mode to 'Disabled' for a 'Reporting' monitor item. 
        Verifies that data is received(on publish) only when the monitoring mode 
        is 'Reporting'.

    Revision History
        06-Oct-2009 AT: Initial version.
        18-Nov-2009 NP: Revised the script logic.
                        REVIEWED.
*/

function setMonitoringMode593007()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created" );
        return;
    }

    // 1 monitored item (Reporting)
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, -1, TimestampsToReturn.Both );
    if( monitoredItems == null || monitoredItems.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    if( createMonitoredItems( monitoredItems[0], TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        addLog( "Calling Publish (first call) and initial check to make sure NO dataChanges are received!" );
        publishService.Execute();
        AssertEqual( true, publishService.CurrentlyContainsData(), "The initial DataChange notification was expected but not received. We created the subscription (reporting=ENABLED) and then waited for the publish period before calling Publish()." );

        // Set the monitoring mode to Disabled!
        addLog ( "Setting the monitoring mode to an DISABLED" );
        if( setMonitoringService.Execute( MonitoringMode.Disabled, monitoredItems[0], MonitorBasicSubscription ) )
        {
            // wait one publishing cycle before calling publish
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            // Call Publish again to verify that we do not receive any notification this time
            addLog ( "Calling publish again. We should not receive NotificationData still." );
            publishService.Execute();
            AssertEqual( false, publishService.CurrentlyContainsData(), "No dataChanges were expected because the subscription should be disabled! But a DataChange notification was received which is incorrect!" );
        }
    }
    // delete the items we added in this test
    deleteMonitoredItems( monitoredItems[0], MonitorBasicSubscription, g_session );
    publishService.Clear();
}

safelyInvoke( setMonitoringMode593007 );