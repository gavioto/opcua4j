/*  Test 5.9.1 Test 64 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create a monitored item with the nodeId set to that of a non-Variable node and
        the attributeId set to a non-Value attribute. Call Publish.
    Expected Results: 
        All service and operation level results are Good. 
        Publish response contains a DataChangeNotification.

    Revision History:
        11-Dec-2009 NP: Initial Version.
*/

function createMonitoredItems591038()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription not created." );
        return;
    }
    // use the server object, and we'll monitor the DisplayName
    var item = MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.Server ) ], Attribute.DisplayName )[0];

    if( createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        // wait one publishing cycle before calling publish
        wait( MonitorBasicSubscription.RevisedPublishingInterval );
        publishService.Execute();
        AssertTrue( publishService.CurrentlyContainsData(), "Expected to receive a dataChange." );
        deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
    }
}

safelyInvoke( createMonitoredItems591038 );