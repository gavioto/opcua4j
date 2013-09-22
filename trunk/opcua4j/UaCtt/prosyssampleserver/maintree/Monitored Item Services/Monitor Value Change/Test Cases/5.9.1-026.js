/*  Test 5.9.1 Test 26 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Specify a filter using a deadband absolute. Set the deadband value to 2. 
        Write numerous values to the item that will cause 
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
        03-Dec-2009 NP: Revised to meet new test-case requirements.
        04-Dec-2009 NP: Revised to include FLOAT support.
                        REVIEWED.
        09-Dec-2009 DP: Changed test values to reflect spec: DataChangeNotifications
                        occur when abs(lastValue - currentValue) > deadbandValue.
*/

function createMonitoredItems591026()
{
    var integerDeadband   = 2;
    var integerWritesPass = [ 65, 68, 71 ];
    var integerWritesFail = [ 72, 70, 71 ];

    var floatDeadband = 2.2;
    floatWritesPass   = [ 2.5, 5.1, 0.1 ];
    floatWritesFail   = [ -1.1, -0.9, 1.1 ];

    DeadbandAbsoluteFiltering_WritePublishTesting( MonitorBasicSubscription, ReadHelper, WriteHelper, PublishHelper, 
        integerDeadband, integerWritesPass, integerWritesFail,
        floatDeadband,   floatWritesPass,   floatWritesFail );
}

safelyInvoke( createMonitoredItems591026 );