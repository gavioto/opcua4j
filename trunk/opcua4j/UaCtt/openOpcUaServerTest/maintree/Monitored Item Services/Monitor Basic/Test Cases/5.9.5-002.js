/*  Test 5.9.5 Test 2 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script deletes multiple monitored items from asubscription.

    Revision History
        03-Oct-2009 AT: Initial version
        06-Oct-2009 AT: Revised script to delete multiple items and not all (as per the test case).
        03-Nov-2009 NP: Revised to use new script library objects, and to match test-case as revised by CMP WG.
        18-Nov-2009 NP: REVIEWED.
        18-Dec-2009 DP: Uses a NodeId setting that has been configured.
*/

function setTriggering595002()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return;
    }

    var nodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting();
    if( nodeId === undefined || nodeId === null )
    {
        addSkipped( "Dynamic Scalar" );
        return;
    }

    const SETTING_NAMES = [ nodeId.name, 
        nodeId.name,
        nodeId.name,
        nodeId.name,
        nodeId.name,
        nodeId.name ];

    addLog ( "Ready to create 6 monitored items." );
    var items = MonitoredItem.fromSettings( SETTING_NAMES, 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, -1, TimestampsToReturn.Both );
    if( createMonitoredItems( items, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        // delete some items, NOT ALL!
        var itemsToDelete = [ items[0], items[2], items[4] ];
        if( deleteMonitoredItems( itemsToDelete, MonitorBasicSubscription, g_session ) )
        {
            // verify the object is deleted by trying to change the monitoringMode.
            var setMonitoringModeService = new SetMonitoringMode( g_session );
            var expectedErrors = [];
            for( var m=0; m<itemsToDelete.length; m++ )
            {
                expectedErrors[m] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
            }
            setMonitoringModeService.Execute( MonitoringMode.Disabled, itemsToDelete, MonitorBasicSubscription, expectedErrors, true );

            // delete the remaining items
            itemsToDelete = [ items[1], items[3], items[5] ];
            deleteMonitoredItems( itemsToDelete, MonitorBasicSubscription, g_session );
        }
    }
}

safelyInvoke( setTriggering595002 );