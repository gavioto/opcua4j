/*  Test 5.9.1 Test 36 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies a samplingInterval of 0 ms.
        Expected result: ServiceResult/OperationResult: Good
                         The UA server should revise the SamplingInterval to > 0.

    Revision History
        09-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        13-Jul-2010 DP: Reduced the number of required settings from 2 to 1.
*/

function createMonitoredItems591036()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, SAMPLING_INTERVAL, TimestampsToReturn.Both, true );
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
        const SAMPLING_INTERVAL = 0;

        if( createMonitoredItems( items, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
        {
            // Check the SamplingInterval was revised
            if( SAMPLING_INTERVAL === items[0].SamplingInterval )
            {
                addLog( "Server supports a samplingInterval of zero." );
            }
            else
            {
                addLog( "Server DOES NOT support a samplingInterval of zero." );
            }
            deleteMonitoredItems( items, MonitorBasicSubscription, g_session );
        }
    }
}

safelyInvoke( createMonitoredItems591036 );