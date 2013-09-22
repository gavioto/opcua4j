/*  Test 5.9.1 Test 10; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        CreateMonitoredItems uses the following parameter values:
            MODE   = MonitoringMode.Reporting;
            FILTER = Event.GetDataChangeFilter( DeadbandType.Absolute, 0, DataChangeTrigger.StatusValue );
            QUEUE  = 1;
            TIMES  = TimestampsToReturn.Server;
        Expected to succeed.

        Subscription is created and deleted in initialize and cleanup scripts.

    Revision History
        Sep-16-2009 NP: Initial version.
        Nov-16-2009 NP: Added deadband code.
                        REVIEWED.
        18-Nov-2009 DP: Moved global consts to function scope.
*/

function createMonitoredItems591010()
{
    const       MODE   = MonitoringMode.Reporting;
    const       FILTER = Event.GetDataChangeFilter( DeadbandType.Absolute, 0, DataChangeTrigger.StatusValue );
    const       QUEUE  = 1;
    const       TIMES  = TimestampsToReturn.Server;

    basicCreateMonitoredItemsTest( MODE, FILTER, QUEUE, TIMES );
}

safelyInvoke( createMonitoredItems591010 );