/*  Test 6.2 Test 3, prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies MonitoringMode = Reporting, Filter = PercentDeadband, 
        DeadbandValue = 0. Issue 2 writes and call Publish for each write to 
        verify that the written value is received.
    Expectation:
        ServiceResult = “Good”. Verify that only the last value is retrieved.
        Check the statusCode “overflow bit” #7 DOES NOT signal a value was lost due
        to the queue overflow.

    Revision History
            12-Oct-2009 AT: Initial Version
            16-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server returns BadFilterNotAllowed.
            18-Nov-2009 DP: Changed PUBLISHDELAY to one publishing cycle.
            26-Nov-2009 DP: Changed test to use a node that's valid for PercentDeadbands.
                            Script still needs more work as PercentDeadband does not work
                            the way it is tested here (see spec Part 8).
            10-Dec-2009 NP: Revised script to be consistent with the test-case. Deadband works now!
            15-Jan-2010 NP: Revised per the new test-case requirements as of CMP WG Call 14-Jan-2010.
                            Added a test that checks the overflow bit of the StatusCode.
             1-Apr-2010 DP: Flag as not supported if no AnalogItem settings have been configured.
*/

/*globals addError, addNotSupported, ArrayToFormattedString, AssertCoercedEqual, AssertEqual, 
  AssertTrue, Attribute, createMonitoredItems, DataChangeTrigger, DeadbandType, 
  deleteMonitoredItems, Event, g_session, GetEURangeWriteValues, GetNodeIdEURange,
  MonitorBasicSubscription, MonitoredItem, MonitoringMode, NodeIdSettings, OVERFLOWBIT,
  PublishHelper, ReadHelper, safelyInvoke, StatusCode, TimestampsToReturn, wait, WriteHelper
*/


function createMonitoredItems612003()
{
    const WRITE_VALUES_NEEDED = 2;

    const DEADBANDVALUE = 0;
    const QUEUESIZE = 1;
    const DISCARDOLDEST = true;

    var settings = NodeIdSettings.DAStaticAnalog();
    var item = MonitoredItem.fromSettings( settings, 0, Attribute.Value, "", MonitoringMode.Reporting, DISCARDOLDEST, null, QUEUESIZE )[0];
    if( item === undefined )
    {
        addSkipped( "Static Analog" );
        return;
    }

    item.Filter = Event.GetDataChangeFilter( DeadbandType.Percent, DEADBANDVALUE, DataChangeTrigger.StatusValue );

    var eurange = GetNodeIdEURange( item.NodeSetting );
    if( eurange === null || eurange === undefined )
    {
        addError( "Test aborted: Setting '" + item.NodeSetting + "' did not yield a valid nodeId to test." );
        return;
    }
    // get the size of the EURange
    //var getEURangeSize = GetEURangeAsSize( eurange );
    var writesToPass = GetEURangeWriteValues( WRITE_VALUES_NEEDED, eurange, 10, false, 0 );

    // do a read to get the initial data-type
    var detectedDataType;
    if( !ReadHelper.Execute( item ) )
    {
        addError( "Test aborted. Could not read the item that we're about to test writing to!" );
        return;
    }
    detectedDataType = item.Value.Value.DataType;

    // create the monitoredItem
    if( !createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        return;
    }

    // write the values - should cause the queue to overflow
    for( var w=0; w<WRITE_VALUES_NEEDED; w++ )
    {
        item.SafelySetValueTypeKnown( writesToPass[w], detectedDataType );
        WriteHelper.Execute( item );
        // delay the write to allow the sampling engine to detect the change
        wait( item.RevisedSamplingInterval );
    }// for w...

    // call Publish
    if( PublishHelper.Execute() )
    {
        if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected 0% deadband to yield the dataChange results that echo the values written." ) )
        {
            // check the last value was received
            AssertCoercedEqual( writesToPass[WRITE_VALUES_NEEDED - 1], PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value, "Value received does not match the LAST value written." );
            // check the overflow bit
            AssertNotEqual( StatusCode.Good | OVERFLOWBIT, PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.StatusCode.StatusCode, "StatusCode overflow bit is active after a value was lost from the queue." );
        }
    }

    // clean-up
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems612003 );