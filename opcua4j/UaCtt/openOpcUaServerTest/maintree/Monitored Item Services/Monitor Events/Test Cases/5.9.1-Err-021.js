/*  Test 5.9.1 Error Test 21 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
       Specify an Event Filter on a Node that does not support Events.

       We expect error "Bad_FilterNotAllowed".

    Revision History:
        02-Nov-2009 NP: Initial Version.
        24-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Unsure if script or UA Server is correct.
        11-Dec-2009 DP: Use a node that is configured in settings.
        10-Dec-2010 MI: Error shall be on OperationLevel not on ServiceLevel
*/

function createMonitoredItems591err021()
{
    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    var monitoredItem = MonitoredItem.fromSetting( nodeSetting.name, 0 );
    if( AssertNotNullOrEmpty( monitoredItem ) )
    {
        print( monitoredItem.toString() );
        // set the filter
        monitoredItem.Filter = Event.GetEventFilter( ["SourceName", "Message", "Severity", "ReceiveTime"] );

        // create the subscription
        var subscription = new Subscription();
        if( createSubscription( subscription, g_session ) )
        {
            // add the monitoredItem, but we expect it to fail so define the expected failure
            var expectedError = [ new ExpectedAndAcceptedResults( StatusCode.BadFilterNotAllowed ) ];
            
            createMonitoredItems( monitoredItem, TimestampsToReturn.Both, subscription, g_session, expectedError, true ) 
            deleteSubscription( subscription, g_session );
        }
    }
}

safelyInvoke( createMonitoredItems591err021 );