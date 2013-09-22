/*  Test 5.9.1 Test 14; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        CreateMonitoredItems uses the following parameter values:
            MODE   = MonitoringMode.Reporting;
            FILTER = null;
            QUEUE  = 1;
            TIMES  = TimestampsToReturn.Source;
        Expected to succeed.

        subscription is created and deleted in initialize and cleanup scripts

    Revision History
        Sep-16-2009 NP: Initial version.
        Nov-16-2009 NP: REVIEWED.
        18-Nov-2009 DP: Moved global consts to function scope.
        09-Dec-2009 DP: Select a NodeId setting more dynamically.
                        Added required TimestampsToReturn to function call.
*/

function createMonitoredItems591014()
{
    //const MODE   = MonitoringMode.Reporting;
    const FILTER = null;
    const QUEUE  = 1;
    const TIMES  = TimestampsToReturn.Source;

    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( nodeSetting === undefined || nodeSetting === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    var valuesToWrite = new UaVariants();
    GenerateScalarValue( valuesToWrite[0], nodeSetting.datatype, 13 );
    GenerateScalarValue( valuesToWrite[1], nodeSetting.datatype, 14 );
    
    createMonitoredItemsTestQueueSize( QUEUE, true, nodeSetting.name, valuesToWrite, g_session, MonitorBasicSubscription, FILTER, TIMES );
}

safelyInvoke( createMonitoredItems591014 );