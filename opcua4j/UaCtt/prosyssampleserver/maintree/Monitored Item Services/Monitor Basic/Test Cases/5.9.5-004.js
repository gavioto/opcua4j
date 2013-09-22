/*  Test 5.9.5 Test 4 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script deletes all monitored items from a subscription.

    Revision History
        06-Oct-2009 AT: Initial version
        03-Nov-2009 NP: Revised to use new script library objects, and to match test-case as revised by CMP WG.
        18-Nov-2009 NP: REVIEWED.
        21-Jan-2010 DP: Changed to use NodeId settings from Scalar Set 1.
        13-Jul-2010 DP: Use additional scalar node settings.
*/

function setTriggering595004()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return;
    }

    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStaticAll(), 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, -1, TimestampsToReturn.Both );
    if( items == null || items.length < 3 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    if( createMonitoredItems( items, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        if( deleteMonitoredItems( items, MonitorBasicSubscription, g_session ) )
        {
            // verify the object is deleted by trying to change the monitoringMode.
            var setMonitoringModeService = new SetMonitoringMode( g_session );
            var expectedErrors = []
            for( var m=0; m<items.length; m++ )
            {
                expectedErrors[m] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
            }
            AssertEqual( true, setMonitoringModeService.Execute( MonitoringMode.Disabled, items, MonitorBasicSubscription, expectedErrors, true ), "Expected SetPublishingMode() call to fail because the specified monitoredItem was previously deleted." );
        }
    }
}

safelyInvoke( setTriggering595004 );