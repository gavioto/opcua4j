/*  Test 6.2 Error 4 prepared by Kevin Herron: kevin@inductiveautomation.ocm
    Description:
        Create MonitoredItems of the following types:
            String, Boolean, ByteString, DateTime.
        For each, specify a PercentDeadband of 10%.

    Expected results:
        ServiceLevel: “Good”.
        OperationLevel: Bad_MonitoredItemFilterInvalid

    Revision History:
        02-Mar-2010 KH: Initial version.
        02-Mar-2010 NP: REVIEWED.
        17-May-2010 DP: Fixed bug: replaced undefined const with a defined var ("settings").
                        Fixed bug: script was aborting if any setting was undefined; now it
                        only aborts when no settings are defined.
        07-Jul-2010 NP: Permitted "BadMonitoredItemFilterUnsupported" also.
*/

function createMonitoredItemErr612004()
{
    const DEADBANDVALUE = 10;

    const STRING_NODE_SETTING  = "/Server Test/NodeIds/Static/All Profiles/Scalar/String";
    const BOOLEAN_NODE_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool";
    const BYTESTRING_NODE_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString";
    const DATETIME_NODE_SETTING   = "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime";

    var settings = [ STRING_NODE_SETTING,
                     BOOLEAN_NODE_SETTING,
                     BYTESTRING_NODE_SETTING,
                     DATETIME_NODE_SETTING ];
    var items = [ MonitoredItem.fromSetting( STRING_NODE_SETTING, 0 ),
                  MonitoredItem.fromSetting( BOOLEAN_NODE_SETTING, 1 ),
                  MonitoredItem.fromSetting( BYTESTRING_NODE_SETTING, 2 ),
                  MonitoredItem.fromSetting( DATETIME_NODE_SETTING, 3 ) ];
    var expectedResults = [];

    i = 0;
    while( i < items.length )
    {
        if( items[i] == null )
        {
            items.splice(i, 1);
            continue;
        }
        // Set the filter to PercentDeadband
        items[i].Filter = Event.GetDataChangeFilter( DeadbandType.Percent, DEADBANDVALUE, DataChangeTrigger.StatusValue );
        
        expectedResults[i] = new ExpectedAndAcceptedResults( StatusCode.BadFilterNotAllowed );
        expectedResults[i].addExpectedResult( StatusCode.BadMonitoredItemFilterUnsupported );

        i++;
    }
    
    if( items.length === 0 )
    {
        addWarning( "Test cannot be completed: no non-numeric nodes configured in settings: " + ArrayToFormattedString( NodeIdSettings.GetUniqueSettingsParents( settings ), "and" ) + ")." );
        _dataTypeUnavailable.store( [ "String", "Boolean", "ByteString", "DateTime" ] );
        return;
    }

    // create the monitored items, which we expect to fail
    createMonitoredItems( items, TimestampsToReturn.Both, MonitorBasicSubscription, g_session, expectedResults, true);

    // delete the monitored items, which should fail.
    expectedResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
    expectedResult.addExpectedResult( StatusCode.Good );
    deleteMonitoredItems( items, MonitorBasicSubscription, g_session, expectedResult, false );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItemErr612004 );