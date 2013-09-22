/*  Test 5.9.5-001 prepared by Development; compliance@opcfoundation.org
    Description:
        Specifies a valid subscriptiondId and triggeringItem, with a valid link also.

    Revision History
        Oct-01-2009 DEV: Initial version
        Nov-03-2009 NP : Revised to match the test case as modified by the CMP WG.
        Nov-18-2009 NP : REVIEWED.
*/

function setTriggering595001()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, -1, TimestampsToReturn.Both, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    // subscription is created and deleted in initialize and cleanup scripts
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return;
    }
    if( createMonitoredItems( items[0], TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        // delete monitored item
        if( deleteMonitoredItems( items[0], MonitorBasicSubscription, g_session ) )
        {
            // verify the object is deleted by trying to change the monitoringMode.
            var setMonitoringModeService = new SetMonitoringMode( g_session );
            var expectedErrors = [ new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid ) ];
            AssertEqual( true, setMonitoringModeService.Execute( MonitoringMode.Disabled, items[0], MonitorBasicSubscription, expectedErrors, true ), "Expected SetPublishingMode() call to fail because the specified monitoredItem was previously deleted." );
        }
    }
}

safelyInvoke( setTriggering595001 );