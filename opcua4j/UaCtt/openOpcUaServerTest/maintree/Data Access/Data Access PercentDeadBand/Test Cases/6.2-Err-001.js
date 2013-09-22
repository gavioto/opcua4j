/*  Test 6.2 Error 1 prepared by Kevin Herron: kevin@inductiveautomation.ocm
    Description:
        Create a MonitoredItem and specify an attribute (NOT the .Value attribute)
        to monitor for change, and specify a filter criteria of type PercentDeadband.

    Expected results:
        ServiceLevel: “Good”.
        OperationLevel: Bad_FilterNotAllowed.

    Revision History:
        02-Mar-2010 KH: Initial version.
        02-Mar-2010 NP: REVIEWED.
        05-Apr-2010 DP: Flag as not supported if no AnalogItem settings have been configured.
*/

/*globals addNotSupported, ArrayToFormattedString, Attribute,
  createMonitoredItems, DataChangeTrigger, DeadbandType, deleteMonitoredItems, Event, 
  ExpectedAndAcceptedResults, g_session,  
  MonitorBasicSubscription, MonitoredItem, MonitoringMode, NodeIdSettings, 
  safelyInvoke, StatusCode, TimestampsToReturn
*/

 
function createMonitoredItemErr612001()
{
    const QUEUESIZE = 4;
    const DEADBANDVALUE = 10;
    const DISCARDOLDEST = false;

    // Create a MonitoredItem and specify an attribute that is NOT the Value attribute
    var settings = NodeIdSettings.DAStaticAnalog();
    var item = MonitoredItem.fromSettings( settings, 0, Attribute.DisplayName, "", MonitoringMode.Reporting, DISCARDOLDEST, null, QUEUESIZE )[0];
    if( item === undefined )
    {
        addSkipped( "Static Analog" );
        return;
    }

    // Set the filter to PercentDeadband
    item.Filter = Event.GetDataChangeFilter( DeadbandType.Percent, DEADBANDVALUE, DataChangeTrigger.StatusValue );

    // create the monitored items, which we expect to fail
    var expectedResult = [ new ExpectedAndAcceptedResults( StatusCode.BadFilterNotAllowed ) ];
    createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session, expectedResult, true );

    // delete the monitored items, which should fail.
    expectedResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session, expectedResult, false );
}

safelyInvoke( createMonitoredItemErr612001 );