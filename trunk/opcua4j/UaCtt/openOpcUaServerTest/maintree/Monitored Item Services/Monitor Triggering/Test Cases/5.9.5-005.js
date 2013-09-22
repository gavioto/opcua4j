/*  Test 5.9.5 Test 5 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script delete "items to report" items.

    Revision History
        03-Oct-2009 AT: Initial version.
        03-Nov-2009 NP: Revised to use new script library objects, and to match test-case as revised by CMP WG.
        18-Nov-2009 NP: REVIEWED/INCONCLUSIVE. OPCF UA Server returns Bad_NotImplemented.
        09-Jun-2010 NP: Corrected CreateMonitoredItems to use only 2 items (not all)
        13-Jul-2010 DP: Use additional scalar node settings.
*/

function setTriggering595005()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStaticAll(), 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, -1, TimestampsToReturn.Both, true );
    if( items == null || items.length < 2 )
    {
        addSkipped( "Static Scalar" );
        return;
    }


    if( !MonitorTriggeringSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return;
    }

    items[1].MonitoringMode = MonitoringMode.Disabled;

    // add the items to the subscription
    if( createMonitoredItems( [items[0], items[1]], TimestampsToReturn.Both, MonitorTriggeringSubscription, g_session ) )
    {
        // delete the linked item
        if( deleteMonitoredItems( [items[1]], MonitorTriggeringSubscription, g_session ) )
        {
            // add a triggered link
            addLog( "** Now to delete the linked item in a call to SetTriggering **" );
            var setTriggeringService = new SetTriggering( g_session );
            var expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid ) ];
            setTriggeringService.Execute( MonitorTriggeringSubscription, items[0], null, [ items[1] ], true, null, expectedResults );
        }// setTriggering
        // delete the remaining item
        deleteMonitoredItems( [items[0]], MonitorTriggeringSubscription, g_session );
    }// createMonitoredItems
}

safelyInvoke( setTriggering595005 );