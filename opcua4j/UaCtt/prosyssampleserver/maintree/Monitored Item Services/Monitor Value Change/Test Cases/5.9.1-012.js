/*  Test 5.9.1 Test 12; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        CreateMonitoredItems uses the following parameter values:
            MODE   = MonitoringMode.Reporting;
            FILTER = null;
            QUEUE  = 1;
            TIMES  = TimestampsToReturn.Server;
        Expected to succeed.

        subscription is created and deleted in initialize and cleanup scripts

    Revision History
        Sep-16-2009 NP: Initial version.
        Nov-16-2009 NP: REVIEWED.
        18-Nov-2009 DP: Moved global consts to function scope.
*/

function createMonitoredItems591012()
{
    const       MODE   = MonitoringMode.Reporting;
    const       FILTER = null;
    const       QUEUE  = 1;
    const       TIMES  = TimestampsToReturn.Server;

    basicCreateMonitoredItemsTest( MODE, FILTER, QUEUE, TIMES );
}

safelyInvoke( createMonitoredItems591012 );