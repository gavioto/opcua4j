/*    Test 5.9.4 Test 5 prepared by Anand Taparia; ataparia@kepware.com
      Description:
          Script does multiple linksToAdd[] and linksToRemove[].
          Steps:
          - Create 5 monitored items.
          - SetTrigger: 1 triggereditem + 2 linksToAdd[]
          - Actual test: SetTrigger: Remove the 2 links added above and add 2 new linksToAdd[]

      Revision History
        Oct-06-2009 AT: Initial version.
        Nov-18-2009 NP: REVIEWED/INCONCLUSIVE. OPCF UA Sample Server does not implement SetTriggering.
        Jan-19-2010 DP: Changed NodeId settings to be from Scalar Set 1.
        Mar-26-2010 DP: Changed NodeId settings to be from any static scalar.
*/

/*globals addError, addLog, Attribute, checkCreateMonitoredItemsValidParameter,
  checkSetTriggeringValidParameter, deleteMonitoredItems, g_session, MonitoredItem,
  MonitoringMode, MonitorTriggeringSubscription, NodeIdSettings, print, safelyInvoke,
  TimestampsToReturn, UaCreateMonitoredItemsRequest, UaCreateMonitoredItemsResponse, 
  UaMonitoredItemCreateRequest, UaSetTriggeringRequest, UaSetTriggeringResponse, UaUInt32s
*/

function setTriggering594005()
{
    var allApplicableNodeSettings = NodeIdSettings.ScalarStaticAll().concat( NodeIdSettings.DAAStaticDataItem(), NodeIdSettings.DAStaticAnalog() );
    var items = MonitoredItem.createMinimumMonitoredItemsFromSettings( allApplicableNodeSettings, 3 );
    if( items === null || items.length === 0 )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    if( items.length < 5 )
    {
        addSkipped( "Need a minimum of 5 items for this test from the Settings 'NodeIds\Static\All Profiles\Scalar'." );
        return;
    }

    if( !MonitorTriggeringSubscription.SubscriptionCreated )
    {
        addError( "Subscription for conformance unit Monitor Triggering was not created." );
    }
    else
    {
        // trigger is reporting
        items[0].MonitoringMode = MonitoringMode.Reporting;
        // all linked items are sampling
        for( var i=1; i<items.length; i++ )
        {
            items[i].MonitoringMode = MonitoringMode.Sampling;
        }
        if( createMonitoredItems( items, TimestampsToReturn.Both, MonitorTriggeringSubscription, g_session ) )
        {
            addLog ( "Setting up trigger(SetTrigger: 2 linksToAdd[])." );
            var addLinkedItems = [ items[1], items[2] ];
            if( SetTriggeringHelper.Execute( MonitorTriggeringSubscription, items[0], addLinkedItems ) )
            {
                // We have setup everything. Now the actual test. 
                // Remove the links added above and also add new links at the same time
                var removedLinkedItems = [ items[1], items[2] ];
                addLinkedItems = [ items[3], items[4] ];
                SetTriggeringHelper.Execute( MonitorTriggeringSubscription, items[0], addLinkedItems );
            }
        }
        // delete the items we added in this test
        deleteMonitoredItems( items, MonitorTriggeringSubscription, g_session );
    }
}

safelyInvoke( setTriggering594005 );