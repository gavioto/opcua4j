/*  Test 5.9.1 Test 15; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        CreateMonitoredItems uses the following parameter values:
            MODE   = MonitoringMode.Reporting;
            FILTER = null; // needs to reflect whatever "OFF" means????
            QUEUE  = 1;
            TIMES  = TimestampsToReturn.Server;
        Expected to succeed.

        subscription is created and deleted in initialize and cleanup scripts
        
    Revision History
        Sep-16-2009 NP: Initial version.
        Nov-16-2009 NP: Corrected the script to call the correct test script.
                        Added logic to verify the correct timestamps are being returned.
                        REVIEWED.
        18-Nov-2009 DP: Moved global consts to function scope.
        09-Dec-2009 DP: Select a NodeId setting more dynamically.
*/

function createMonitoredItems591015()
{
    //const MODE   = MonitoringMode.Reporting;
    const FILTER = null; // needs to reflect whatever "OFF" means????
    const QUEUE  = 1;
    const TIMES  = TimestampsToReturn.Server;

    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( nodeSetting === undefined || nodeSetting === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    var valuesToWrite = new UaVariants();
    GenerateScalarValue( valuesToWrite[0], nodeSetting.datatype, 15 );
    GenerateScalarValue( valuesToWrite[1], nodeSetting.datatype, 16 );
    
    createMonitoredItemsTestQueueSize( QUEUE, true, nodeSetting.name, valuesToWrite, g_session, MonitorBasicSubscription, FILTER, TIMES )
}

safelyInvoke( createMonitoredItems591015 );