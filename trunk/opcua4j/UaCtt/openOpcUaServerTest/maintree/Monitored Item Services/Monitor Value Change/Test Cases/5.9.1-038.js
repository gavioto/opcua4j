/*  Test 5.9.1 Test 38 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies samplingInterval of max duration (max real value)
        Expected result: ServiceResult/OperationResult: Good
        The UA server should revise the SamplingInterval to the maximum value(slowest) it can support.

    Revision History
        09-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        13-Jul-2010 DP: Reduced the number of required settings from 2 to 1.
*/

function createMonitoredItems591038()
{
    const LARGE_SAMPLING_INTERVAL = Constants.Double_Max;
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, LARGE_SAMPLING_INTERVAL, TimestampsToReturn.Both, true );
    if( items == null || items.length == 1 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created." );
    }
    else
    {
        if( createMonitoredItems( items, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
        {
            // Check the SamplingInterval was revised
            AssertNotEqual( LARGE_SAMPLING_INTERVAL, items[0].RevisedSamplingInterval, "Large Sampling period was not revised!" );
            deleteMonitoredItems( items, MonitorBasicSubscription, g_session );
        }
    }
}

safelyInvoke( createMonitoredItems591038 );