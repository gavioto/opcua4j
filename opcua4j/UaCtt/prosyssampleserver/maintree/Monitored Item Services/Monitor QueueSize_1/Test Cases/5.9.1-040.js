/*  Test 5.9.1 Test 40 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies queueSize = 1 and discardOldest = true. Writes 5 unique values and calls publish.
        Expected result: ServiceResult/OperationResults: Good
            - Only the last item should be received in the callback.

    Revision History
        11-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        11-Dec-2009 DP: Select a NodeId setting more dynamically.
*/

function createMonitoredItems591040()
{
    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( nodeSetting === undefined || nodeSetting === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    var valuesToWrite = new UaVariants();
    GenerateScalarValue( valuesToWrite[0], nodeSetting.datatype, 1 );
    GenerateScalarValue( valuesToWrite[1], nodeSetting.datatype, 2 );
    GenerateScalarValue( valuesToWrite[2], nodeSetting.datatype, 3 );
    GenerateScalarValue( valuesToWrite[3], nodeSetting.datatype, 4 );
    GenerateScalarValue( valuesToWrite[4], nodeSetting.datatype, 5 );
    
    createMonitoredItemsTestQueueSize( 1, true, nodeSetting.name, valuesToWrite, g_session, MonitorQueueSize1Subscription );
}

safelyInvoke( createMonitoredItems591040 );