/*  Test 5.9.5 Error Test 3 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies a valid subscriptionId and multiple invalid monitoredItemIds.

    Revision History
        03-Oct-2009 AT: Initial version.
        03-Nov-2009 NP: Revised to use new script library objects, and to conform to modified test case from CMP WG.
        18-Nov-2009 NP: Revised the script to meet the needs of the test-case.
                        REVIEWED/INCONCLUSIVE. OPCF UA Server returns BadUnexpectedError when deleting invalid items.
        04-Dec-2009 DP: Aligned number of expected errors with number of settings.
        18-Dec-2009 DP: Uses a configured NodeId setting.
*/

function deleteMonitoredItems595Err003()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }
    var nodeId = NodeIdSettings.GetAScalarStaticNodeIdSetting();
    if( nodeId === undefined || nodeId === null )
    {
        addSkipped( "Static Scalar" );
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
        // break some of the monitoredItems Ids
        items[0].MonitoredItemId += 0x123;
        items[2].MonitoredItemId += 0x123;
        var expectedErrors = [
            new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid ),
            new ExpectedAndAcceptedResults( StatusCode.Good ),
            new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid ),
            new ExpectedAndAcceptedResults( StatusCode.Good ),
            new ExpectedAndAcceptedResults( StatusCode.Good ),
            new ExpectedAndAcceptedResults( StatusCode.Good ) ];

        // delete the item, some results SHOULD FAIL!
        deleteMonitoredItems( items, MonitorBasicSubscription, g_session, expectedErrors, true );

        // correct the itemIds we broke earlier, and then delete them
        items[0].MonitoredItemId -= 0x123;
        items[2].MonitoredItemId -= 0x123;
        deleteMonitoredItems( [ items[0], items[2] ], MonitorBasicSubscription, g_session );
    }
}

safelyInvoke( deleteMonitoredItems595Err003 );