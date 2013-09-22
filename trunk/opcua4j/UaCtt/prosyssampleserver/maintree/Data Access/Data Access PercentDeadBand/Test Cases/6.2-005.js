/*  Test 6.2 Test #5, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Create a subscription with an initial deadbandPercent set to 10%. 
        Call ModifyMonitoredItems to change the deadbandPercent to 25% and then issue Write()
        and Publish() calls to verify the accuracy of the deadband.

    Revision History
        16-Oct-2009 NP: Initial Version.
        16-Dec-2009 NP: Re-written, per new test-case requirements.
         1-Apr-2010 DP: Flag as not supported if no AnalogItem settings have been configured.
*/

/*globals addError, addNotSupported, ArrayToFormattedString, AssertCoercedEqual, AssertFalse,
  AssertTrue, Attribute, createMonitoredItems, DataChangeTrigger, DeadbandType, 
  deleteMonitoredItems, Event, g_session, GetEURangeAsSize, GetEURangeWriteValues, 
  GetNodeIdEURange, ModifyMIsHelper, MonitorBasicSubscription, MonitoredItem,
  MonitoringMode, NodeIdSettings, print, PublishHelper, ReadHelper, safelyInvoke, 
  TimestampsToReturn, wait, WriteHelper
*/


function createMonitoredItems612005()
{
    const WRITE_VALUES_NEEDED = 2;
    const DEADBAND_INITIAL = 10;
    const DEADBAND_NEW     = 25;
    var settings = NodeIdSettings.DAStaticAnalog();
    var item = MonitoredItem.fromSettings( settings, 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 0 )[0];
    if( item === undefined )
    {
        addSkipped( "Static Analog" );
        return;
    }
    item.Filter = Event.GetDataChangeFilter( DeadbandType.Percent, DEADBAND_INITIAL, DataChangeTrigger.StatusValue );

    var eurange = GetNodeIdEURange( item.NodeSetting );
    if( eurange === null || eurange === undefined )
    {
        addError( "Test aborted: Setting '" + item.NodeSetting + "' did not yield a valid nodeId containing an EURange to test." );
        return;
    }

    // do a read to get the initial data-type
    var detectedDataType;
    if( !ReadHelper.Execute( item ) )
    {
        addError( "Test aborted: Could not read the node (" + item.NodeSetting + ")." );
        return;
    }
    detectedDataType = item.Value.Value.DataType;

    // create the monitoredItem
    if( !createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        addError( "Test aborted. CreateMonitoredItems failed." );
        return;
    }

    // get the size of the EURange
    //var getEURangeSize = GetEURangeAsSize( eurange );
    var writesToPass = GetEURangeWriteValues( WRITE_VALUES_NEEDED, eurange, DEADBAND_NEW, true, eurange.Low );
    var writesToFail = GetEURangeWriteValues( WRITE_VALUES_NEEDED, eurange, DEADBAND_NEW, false, eurange.Low );

    // modify the monitoredItem
    item.Filter = Event.GetDataChangeFilter( DeadbandType.Percent, DEADBAND_NEW, DataChangeTrigger.StatusValue );
    if( !ModifyMIsHelper.Execute( item, TimestampsToReturn.Both, MonitorBasicSubscription ) )
    {
        addError( "Test aborted. Could not modify the monitored item to use another filter!" );
        deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
        return;
    }

    // write the values that we expect to pass
    // but, set the value to the max Range first, to guarantee a success with the first item
    item.SafelySetValueTypeKnown( eurange.High, detectedDataType );
    if( !WriteHelper.Execute( item ) )
    {
        addError( "Test aborted. Could not set the initial value of " + eurange.High + " to guarantee the first write as a success." );
        deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
        return;
    }
    
    wait( MonitorBasicSubscription.RevisedPublishingInterval );
    PublishHelper.Execute();

    var w;
    for( w=0; w<WRITE_VALUES_NEEDED; w++ )
    {
        item.SafelySetValueTypeKnown( writesToPass[w], detectedDataType );
        WriteHelper.Execute( item, undefined, undefined, false );
        wait( item.RevisedSamplingInterval );
        PublishHelper.Execute();
        if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected a dataChange for the value written." ) )
        {
            PublishHelper.SetItemValuesFromDataChange( item );
            AssertCoercedEqual( writesToPass[w], item.Value.Value, "Expected to receive the same value as written." );
        }
    }// for w...


    print( "\n\n\n\n\nNow part 2, test values we expect to be filtered by the deadband...\n\n\n" );
    // now to reset the items value, and to then write values that we expect to be
    // filtered by the deadband
    item.SafelySetValueTypeKnown( eurange.Low, detectedDataType );
    if( !WriteHelper.Execute( item ) )
    {
        addError( "Test aborted. Could not set the initial value of " + eurange.Low + " to guarantee the first write as a FAIL." );
        deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
        return;
    }
    wait( MonitorBasicSubscription.RevisedPublishingInterval );
    PublishHelper.Execute();
    for( w=0; w<WRITE_VALUES_NEEDED; w++ )
    {
        item.SafelySetValueTypeKnown( writesToFail[w], detectedDataType );
        WriteHelper.Execute( item, undefined, undefined, false );
        wait( item.RevisedSamplingInterval );
        PublishHelper.Execute();
        AssertFalse( PublishHelper.CurrentlyContainsData(), "DataChange not expected for the value written." );
    }

    // clean-up
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems612005 );