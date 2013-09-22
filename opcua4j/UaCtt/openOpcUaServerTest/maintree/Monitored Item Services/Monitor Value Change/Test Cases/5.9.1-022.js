/*  Test 5.9.1 Test 22 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Specify various attributes (not just .Value) for monitoring. 
        Filter = DeadbandAbsolute and the deadbandValue is 5.

        Expected Results:
            ServiceResult=”Good”. Operation level result for .Value is “Good”.
            Operation level results for other attributes are "Bad_FilterNotAllowed".

    Revision History
        20-Oct-2009 NP: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        02-Dec-2009 NP: Corrected the filter reporting trigger, it is now: StatusValue.
        09-Dec-2009 DP: Select a NodeId setting more dynamically.
        09-Jun-2010 NP: Allowing Server to return Bad_MonitoredItemFilterUnsupported also.
*/

function createMonitoredItems591022()
{
    const NODE_SETTINGNAME = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( NODE_SETTINGNAME === undefined || NODE_SETTINGNAME === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }

    var filter = Event.GetDataChangeFilter( DeadbandType.Absolute, 5, DataChangeTrigger.StatusValue );

    // get the Nodes to test with..
    var monitoredItems = [
        MonitoredItem.fromSetting( NODE_SETTINGNAME.name, 0, Attribute.Value,       "", MonitoringMode.Reporting, true, filter, 10, -1, TimestampsToReturn.Both ),
        MonitoredItem.fromSetting( NODE_SETTINGNAME.name, 0, Attribute.DisplayName, "", MonitoringMode.Reporting, true, filter, 10, -1, TimestampsToReturn.Both ),
        MonitoredItem.fromSetting( NODE_SETTINGNAME.name, 0, Attribute.WriteMask,   "", MonitoringMode.Reporting, true, filter, 10, -1, TimestampsToReturn.Both )
        ];

    // create the monitored items - we expect this to partially succeed
    var expectedResults = [
        new ExpectedAndAcceptedResults( StatusCode.Good ),
        new ExpectedAndAcceptedResults( StatusCode.BadFilterNotAllowed ),
        new ExpectedAndAcceptedResults( StatusCode.BadFilterNotAllowed )
        ];

    // the server may not support filters at all, so also allow the first item to fail
    expectedResults[0].addAcceptedResult( StatusCode.BadMonitoredItemFilterUnsupported );

    createMonitoredItems( monitoredItems, TimestampsToReturn.Both, MonitorBasicSubscription, g_session, expectedResults, true );

    // clean-up
    deleteMonitoredItems( monitoredItems, MonitorBasicSubscription, g_session );
}

safelyInvoke( createMonitoredItems591022 );