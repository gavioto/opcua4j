/*  Test 5.9.1 Test 18 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Using default parameters to monitor more than 3 items per subscription, 
        with 3 subscriptions. Vary the data-types of the items being 
        subscribed to. Vary the scan rates of the subscriptions 
        to 100, 1000 and 5000 respectively.

    Revision History
        08-Oct-2009 NP: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        24-Dec-2009 DP: Finds variable nodes (instead of any type of node).
        13-Jul-2010 DP: Fixed undeclared variable usage.
                        Use additional scalar node settings.
                        Only warn if there are not enough settings defined.
        23-Mar-2011 NP: Revised to need MORE THAN 3 nodes (removal of duplicate settings limits our ability to use many different nodes.)
*/

function createMonitoredItems591018()
{
    const MONITORINGMODE = MonitoringMode.Reporting;
    const FILTER         = null;
    const REQQUEUESIZE   = 1;
    const TIMESTAMPS     = TimestampsToReturn.Both;
    const SESSIONCOUNT   = 3;

    // get as many nodes as we can
    var settings = NodeIdSettings.ScalarStatic();
    if( settings === undefined || settings === null || settings.length === 0 )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    var items = MonitoredItem.fromSettings( settings, 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 10 );
    if( items.length < 4 )
    {
        addWarning( "Test cannot be completed: " + items.length + " variables are configured in settings but more tha 3 are required for this test." );
        return;
    }

    // test 10 subscriptions per session, 3 sessions!
    basicCreateMonitoredItemsMultipleNodes( items, MONITORINGMODE, FILTER, REQQUEUESIZE, TIMESTAMPS, SESSIONCOUNT );
}

safelyInvoke( createMonitoredItems591018 );