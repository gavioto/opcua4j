/*  Test 6.2 Error 5 prepared by Kevin Herron: kevin@inductiveautomation.ocm
    Description:
        Create a monitoredItem of type AnalogType, specify
        a PercentDeadband value of -1.

    Expected results:
        ServiceLevel=Good.”
        OperationLevel result = Bad_DeadbandFilterInvalid.

    Revision History:
        02-Mar-2010 KH: Initial version.
        02-Mar-2010 NP: REVIEWED.
        17-May-2010 DP: Fixed bug: replaced undefined const with a defined var ("settings").
*/

function createMonitoredItemErr612005()
{
    const DEADBANDVALUE = -1;

    var settings = NodeIdSettings.DAStaticAnalog();
    var item = MonitoredItem.fromSettings( NodeIdSettings.DAStaticAnalog() )[0];
    if( item === undefined )
    {
        addSkipped( "Static AnalogItem" );
        return;
    }

    // Set the filter to PercentDeadband
    item.Filter = Event.GetDataChangeFilter( DeadbandType.Percent, DEADBANDVALUE, DataChangeTrigger.StatusValue );

    // create the monitored item, which we expect to fail
    var expectedResult = [ new ExpectedAndAcceptedResults( StatusCode.BadDeadbandFilterInvalid ) ];
    createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session, expectedResult, true );

    // delete the monitored item, which we expect to also fail!
    expectedResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session, expectedResult, false );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItemErr612005 );