/*  Test 5.10.4 Error Test 8 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Specify a filter using a deadband absolute. Set the deadband value to be 
        the equivalent of 25. Write numerous values to the item that will cause 
        event notifications to be sent, and for some items to be filtered. 

        Call Publish to verify the deadband is correctly filtering values.

        Expected Results:
            ServiceResult=”Good”, operation level result also “Good”.
            However, we ONLY expect values that pass the deadband to be received 
            when invoking Publish.

    Revision History
        20-Oct-2009 NP: Initial Version.
        16-Nov-2090 NP: Corrected the deadband % value.
                        Corrected the verification being used on Publish() calls.
        02-Dec-2009 NP: REVIEWED.
        09-Dec-2009 DP: Changed test values to reflect spec: DataChangeNotifications
                        occur when abs(lastValue - currentValue) > deadbandValue.
        26-Mar-2010 NP: MOVED from the MONITOR VALUE CHANGE conformance unit.
*/

function createMonitoredItems5104Err008()
{
    var subscription = new Subscription();
    if( !createSubscription( subscription, g_session ) )
    {
        return;
    }

    var integerDeadband   = 25;
    var integerWritesPass = [ 50, 76, 102, 27, 1 ];
    var integerWritesFail = [ 24, 1, 26, 2, 22, 22 ];

    var floatDeadband = 0.0625;
    floatWritesPass   = [ -0.0625, 0.001, 0.0636, 0.1262, 0 ];
    floatWritesFail   = [ 0.0623, 0.011, 0.0532, 0.0219, 0.0624, 0.0624 ];

    DeadbandAbsoluteFiltering_WritePublishTesting( subscription, readService, writeService, publishService, 
        integerDeadband, integerWritesPass, integerWritesFail,
        floatDeadband,   floatWritesPass,   floatWritesFail );

    // delete subscription
    deleteSubscription( subscription, g_session );
    publishService.Clear();
}

safelyInvoke( createMonitoredItems5104Err008 );