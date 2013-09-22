/*  Test 6.2 Error 3 prepared by Kevin Herron: kevin@inductiveautomation.ocm
    Description:
        Create a monitoredItem of non Analog type (a node that does not have an
        EURange property), and specify a PercentDeadband of 10%.

    Expected results:
        ServiceLevel: “Good”.
        OperationLevel: Bad_FilterNotAllowed

    Revision History:
        02-Mar-2010 KH: Initial version.
        02-Mar-2010 NP: REVIEWED.
        07-Jul-2010 NP: Permitted "BadMonitoredItemFilterUnsupported" also.
*/

function createMonitoredItemErr612003()
{
    const DEADBANDVALUE = 10;

    // Should be a non-analog node
    const NODE_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32";

    var item = MonitoredItem.fromSetting( NODE_SETTING, 0 );
    if( item == null )
    {
        _dataTypeUnavailable.store( "UInt32" );
        return;
    }

    // Set the filter to PercentDeadband
    item.Filter = Event.GetDataChangeFilter( DeadbandType.Percent, DEADBANDVALUE, DataChangeTrigger.StatusValue );

    // create the monitored items, which we expect to fail
    var expectedResult = [ new ExpectedAndAcceptedResults( StatusCode.BadFilterNotAllowed ) ];
    expectedResult[0].addExpectedResult( StatusCode.BadMonitoredItemFilterUnsupported );
    createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session, expectedResult, true );

    // delete the monitored items, which should fail.
    expectedResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session, expectedResult, false );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItemErr612003 );