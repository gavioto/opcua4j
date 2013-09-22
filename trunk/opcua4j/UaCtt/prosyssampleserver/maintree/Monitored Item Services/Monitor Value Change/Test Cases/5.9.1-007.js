/*  Test 5.9.1 Test 7; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        CreateMonitoredItems uses the following parameter values:
            MODE   = MonitoringMode.Sampling;
            FILTER = Event.GetDataChangeFilter( DeadbandType.Absolute, 0, DataChangeTrigger.StatusValue );
            QUEUE  = 0;
            TIMES  = TimestampsToReturn.Server;
        Expected to succeed.

        subscription is created and deleted in initialize and cleanup scripts
        
    Revision History
        Sep-16-2009 NP: Initial version.
        Nov-16-2009 NP: Added deadband code.
                        Added verification that no callbacks received.
                        REVIEWED.
        18-Nov-2009 DP: Moved global consts to function scope.
*/

function createMonitoredItems591007()
{
    const       MODE   = MonitoringMode.Sampling;
    const       FILTER = Event.GetDataChangeFilter( DeadbandType.Absolute, 0, DataChangeTrigger.StatusValue );
    const       QUEUE  = 0;
    const       TIMES  = TimestampsToReturn.Server;

    basicCreateMonitoredItemsTest( MODE, FILTER, QUEUE, TIMES )
}

safelyInvoke( createMonitoredItems591007 );