/*  Test 5.9.5 Test 3 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script deletes an item that is configured for triggering.

    Revision History:
        03-Oct-2009 AT: Initial version.
        03-Nov-2009 NP: Revised to use new script library objects, and to match test-case as revised by CMP WG.
        25-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support Triggering.
        19-Jul-2010 NP: Corrected logic to prevent DeleteMonitoredItems being called twice.
*/

function setTriggering595003()
{
    if( !MonitorTriggeringSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }

    // create the 2 items where:
    //   item #1 is the TRIGGERING item (monitoringMode = reporting)
    //   item #2 is the LINKED item (monitoringMode = disabled)
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
    if( items == null || items.length < 2 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    items[1].MonitoringMode = MonitoringMode.Disabled;

    // read the item to get its value and data-type
    ReadHelper.Execute( items );

    // add the items to the subscription
    if( createMonitoredItems( items, TimestampsToReturn.Both, MonitorTriggeringSubscription, g_session ) )
    {
        // add a triggered link
        if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, items[0], [ items[1] ] ) )
        {
            if( deleteMonitoredItems( items, MonitorTriggeringSubscription, g_session ) )
            {
                // we are now to WRITE a value to the node that was previously used in the
                // monitoredItem that we just deleted
                items[0].SafelySetValueTypeKnown( ( items[0].Value + 1 ), NodeIdSettings.guessType( items[0].NodeSetting ) );
                if( WriteHelper.Execute( items[0] ) )
                {
                    AssertEqual( true,  PublishHelper.Execute(), "Publish() expected to succeed." );
                    AssertEqual( false, PublishHelper.CurrentlyContainsData(), "No datachanges expected." );
                }
            }// deleteMonitoredItems
        }// setTriggering
        else
        {
            deleteMonitoredItems( items, MonitorTriggeringSubscription, g_session );
        }
    }// createMonitoredItems
}

safelyInvoke( setTriggering595003 );