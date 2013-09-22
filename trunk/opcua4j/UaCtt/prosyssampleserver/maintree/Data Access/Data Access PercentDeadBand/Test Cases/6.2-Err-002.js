/*  Test 6.2 Error 2 prepared by Kevin Herron: kevin@inductiveautomation.ocm
    Description:
        Create a MonitoredItem and specify a PercentDeadband with a value of 125%.

    Expected results:
        ServiceLevel: “Good”.
        OperationLevel: Bad_DeadbandFilterInvalid

    Revision History:
        02-Mar-2010 KH: Initial version.
        02-Mar-2010 NP: REVIEWED.
        17-May-2010 DP: Fixed bug: replaced undefined const with a defined var ("settings").
*/

function createMonitoredItemErr612002()
{
    const DEADBANDVALUE = 125;

    var settings = NodeIdSettings.DAStaticAnalog();
    var item = MonitoredItem.fromSettings( settings )[0];
    if( item === undefined )
    {
        addSkipped( "Static Analog" );
        return;
    }
    
    // Set the filter to PercentDeadband
    item.Filter = Event.GetDataChangeFilter(DeadbandType.Percent, DEADBANDVALUE, DataChangeTrigger.StatusValue);
    
    // create the monitored items, which we expect to fail
    var expectedResult = [new ExpectedAndAcceptedResults(StatusCode.BadDeadbandFilterInvalid)];
    createMonitoredItems(item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session, expectedResult, true);

    // delete the monitored items, which should fail.
    expectedResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session, expectedResult, false );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItemErr612002 );