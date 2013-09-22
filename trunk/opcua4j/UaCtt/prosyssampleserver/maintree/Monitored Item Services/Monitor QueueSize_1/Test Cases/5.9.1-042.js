/*  Test 5.9.1 Test 42 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Script specifies queueSize = 1 and discardOldest = false. Writes 5 unique values and calls publish.
        Expected result: ServiceResult/OperationResults: Good
            - Only the last item should be received in the callback.

    Revision History
        12-Oct-2009 NP: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        11-Dec-2009 DP: Select a NodeId setting more dynamically.
*/

function createMonitoredItems291042()
{
    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( nodeSetting === undefined || nodeSetting === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    var valuesToWrite = new UaVariants();
    for( var i=0; i<5; i++ )
    {
        GenerateScalarValue( valuesToWrite[i], nodeSetting.datatype, (1+i) );
    }

    createMonitoredItemsTestQueueSize( 1, false, nodeSetting.name, valuesToWrite, g_session, MonitorQueueSize1Subscription );
}

safelyInvoke( createMonitoredItems291042 );