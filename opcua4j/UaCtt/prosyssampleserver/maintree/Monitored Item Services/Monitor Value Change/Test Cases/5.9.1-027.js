/*  Test 5.9.1 Test 27 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Specify a filter using a deadband absolute. Set the deadband value to be 
        the equivalent of 10. Write numerous values to the item that will cause 
        event notifications to be sent, and for some items to be filtered. 

        Call Publish to verify the deadband is correctly filtering values.

        The following types are tested:
            SByte, Int16, Int32, Int64, Byte, UInt16, UInt32, UInt64, Duration, Float

        Expected Results:
            ServiceResult=”Good”, operation level result also “Good”.
            However, we ONLY expect values that pass the deadband to be received 
            when invoking Publish.

    Revision History
        20-Oct-2009 NP: Initial Version.
        16-Nov-2009 NP: Corrected the % to match the test case.
                        Corrected the verification being used on the Publish() call.
        02-Dec-2009 NP: REVIEWED.
        04-Dec-2009 NP: Revised to include FLOAT support.
                        REVIEWED.
        09-Dec-2009 DP: Changed test values to reflect spec: DataChangeNotifications
                        occur when abs(lastValue - currentValue) > deadbandValue.
*/

function createMonitoredItems591027()
{
    var integerDeadband   = 10;
    var integerWritesPass = [ 50, 61, 100 ];
    var integerWritesFail = [ 101, 108, 91 ];

    var floatDeadband = 0.25;
    floatWritesPass   = [ 0.26, 0.52, 0.77 ];
    floatWritesFail   = [ 0.74, 0.53, 0.9 ];

    DeadbandAbsoluteFiltering_WritePublishTesting( MonitorBasicSubscription, ReadHelper, WriteHelper, PublishHelper, 
        integerDeadband, integerWritesPass, integerWritesFail,
        floatDeadband,   floatWritesPass,   floatWritesFail );
}

safelyInvoke( createMonitoredItems591027 );