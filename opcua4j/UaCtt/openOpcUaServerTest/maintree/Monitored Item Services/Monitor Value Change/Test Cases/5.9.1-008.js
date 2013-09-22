/*  Test 5.9.1 Test 8; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        CreateMonitoredItems uses the following parameter values:
            MODE   = MonitoringMode.Sampling;
            FILTER = null; // needs to reflect whatever "ON" means????
            QUEUE  = 1;
            TIMES  = TimestampsToReturn.Server;
        Expected to succeed.

        subscription is created and deleted in initialize and cleanup scripts
        
    Revision History
        Sep-16-2009 NP: Initial version.
        Nov-16-2009 NP: REVIEWED.
        18-Nov-2009 DP: Moved global consts to function scope.
*/

function createMonitoredItems591008()
{
    const       MODE   = MonitoringMode.Sampling;
    const       FILTER = null; // needs to reflect whatever "ON" means????
    const       QUEUE  = 1;
    const       TIMES  = TimestampsToReturn.Server;
    
    basicCreateMonitoredItemsTest( MODE, FILTER, QUEUE, TIMES );
}

safelyInvoke( createMonitoredItems591008 );