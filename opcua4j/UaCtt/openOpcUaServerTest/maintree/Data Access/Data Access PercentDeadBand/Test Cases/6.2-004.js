/*  Test 6.2 Test 4 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies MonitoringMode = Reporting, QueueSize = 4, Filter = PercentDeadband, 
        DeadbandValue = 10. Issues 5 writes within the 10% range and 5 outside of this range. 
        Calls Publish to verify that only the dataChanges where the values are within the 10% 
        fluctuation are received.

        If the Server revises the queue length to something smaller than the requestedQueueSize 
        then the test must exit not as a warning, but as a skip.
    Expected results:
        All service and operation level results are Good.
        The 2nd Publish call yields a dataChange containing 4 values. 
        The 4 values received match the first 4 valid values written (valid = pass the 
        deadband filter criteria) and in the same order as written. Check the statusCode
        overflow bit” #7 that signals a value was lost due to the queue overflow, for each value.


        Steps:
            - Create monitored item with the above settings
            - Do an initial read to get the current value
            - Perform 5 writes with values within the deadband percent range and 5 outside this range
            - Call publish after each write. DataChange notifications should be received only 
              for the values that were withing the 10% range

    Revision History
            12-Oct-2009 AT: Initial Version.
            16-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server not support deadbands.
            18-Nov-2009 DP: Changed PUBLISHDELAY to one publishing cycle.
            26-Nov-2009 DP: Changed test to use a node that's valid for PercentDeadbands.
                            Script still needs more work as PercentDeadband does not work
                            the way it is tested here (see spec Part 8).
            10-Dec-2009 NP: Revised to meet test-case criteria.
            15-Jan-2010 NP: Revised per the new test-case requirements as of CMP WG Call 14-Jan-2010.
                            Added a test that checks the overflow bit of the StatusCode.
             1-Apr-2010 DP: Flag as not supported if no AnalogItem settings have been configured.
            30-Nov-2010 MI: Changed description. QueueSize is 4
                            Add another write cycle after the second publish and call publish again.
                            The overflow bits are set after the queue in the server is emptied if discard oldest is false.
            03-Dec-2010 NP: requested writesAfterPublish values are calculated based on the last accepted value of
                            writesToPass that the server will be storing.
                            Corrected the overflow bit check to be the newest/last item in the notifications list.
*/

/*globals addError, addNotSupported, ArrayToFormattedString, AssertCoercedEqual, AssertEqual, 
  AssertTrue, Attribute, createMonitoredItems, DataChangeTrigger, DeadbandType, 
  deleteMonitoredItems, Event, g_session, GetEURangeAsSize, GetEURangeWriteValues, 
  GetNodeIdEURange, MonitorBasicSubscription, MonitoredItem, MonitoringMode, NodeIdSettings,
  OVERFLOWBIT, print, PublishHelper, ReadHelper, safelyInvoke, StatusCode, TimestampsToReturn,
  wait, WriteHelper
*/


function createMonitoredItems612004()
{
    const WRITE_VALUES_NEEDED = 5;
    const QUEUESIZE = 4;
    const DEADBANDVALUE = 10;
    const DISCARDOLDEST = false;

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
    var getEURangeSize     = GetEURangeAsSize( eurange );
    var writesToPass       = GetEURangeWriteValues( WRITE_VALUES_NEEDED, eurange, 10, true, eurange.Low );
    var writesAfterPublish = GetEURangeWriteValues( WRITE_VALUES_NEEDED, eurange, 10, true, writesToPass[3] ); //eurange.Low );
    var writesToFail       = GetEURangeWriteValues( WRITE_VALUES_NEEDED, eurange, 10, false, writesToPass[writesToPass.length-1] );
    print( "\n\n\n\n\n" ); //print 5 blank lines so we can see the trace output from the numbers generated in 3 lines above.

    // do a read to get the initial data-type
    var detectedDataType;
    if( !ReadHelper.Execute( item ) )
    {
        addError( "Test aborted: Could not read the node (" + item.NodeSetting + ")." );
        return;
    }
    detectedDataType = item.Value.Value.DataType;

    // set the initial value to the max value supported by the range -1.
    // this will allow all writes we're about to do to succeed, since the generated values
    // start from the lower range
    print( "\tSetting the initial value of the node to be right in the middle of the EURange." );
    item.SafelySetValueTypeKnown( eurange.Low + (getEURangeSize/2), detectedDataType );
    if( !WriteHelper.Execute( item ) )
    {
        addError( "Test aborted: Could not set the initial value for the deadband testing (" + item.NodeSetting + ")." );
    }
    else
    {
        // create the monitoredItem
        if( !createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
        {
            return;
        }
        // check the revised queue length
        if( item.QueueSize < QUEUESIZE )
        {
            addSkipped( "Skipping test. Server revised the QueueSize from '" + QUEUESIZE + "' to '" + item.QueueSize + "' on item '" + item.NodeSetting + "'. A QueueSize of " + QUEUESIZE + " is needed in this test." );
            deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
            return;
        }

        // wait one publishing cycle before calling publish
        wait( MonitorBasicSubscription.RevisedPublishingInterval );

        // call Publish. Do we get initial values?
        PublishHelper.Execute();
        AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive initial dataChange." );

        // write the values - should cause the queue to overflow
        // 5 writes will pass
        var w;
        print( "\n\n\n\nWriting " + WRITE_VALUES_NEEDED + " values (to pass deadband)..." );
        for( w=0; w<WRITE_VALUES_NEEDED; w++ )
        {
            item.SafelySetValueTypeKnown( writesToPass[w], detectedDataType );
            WriteHelper.Execute( item );
            // wait one cycle before moving on... i.e. let server POLL this value 
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
        }// for w...
        // 5 writes will fail
        print( "\n\n\n\nWriting " + WRITE_VALUES_NEEDED + " values (to fail deadband)..." );
        for( w=0; w<WRITE_VALUES_NEEDED; w++ )
        {
            item.SafelySetValueTypeKnown( writesToFail[w], detectedDataType );
            WriteHelper.Execute( item );
            // wait one cycle before moving on... i.e. let server POLL this value 
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
        }

        // call Publish (having issued 10 writes)
        if( PublishHelper.Execute() )
        {
            AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected 0% deadband to yield the dataChange results that echo the values written." );
            AssertEqual( QUEUESIZE, PublishHelper.CurrentDataChanges[0].MonitoredItems.size, "Expected to receive the same number of dataChanges as our Queue is long!" );

            // now to compare the values received with those written
            print( "\n\n\n\n\nChecking Publish notifications match the writes. The values written include: " + writesToPass.toString() );
            PublishHelper.PrintDataChanges();
            for( var c=0; c<QUEUESIZE; c++ ) //c for Compare
            {
                AssertCoercedEqual( writesToPass[c], PublishHelper.CurrentDataChanges[0].MonitoredItems[c].Value.Value, "Expected the same value to be received as was written." );
            }
        }

        // write 5 more times - the next datachange notification should have the overflow bits set
        print( "\n\n\n\nWriting new values that will pass the deadband and cause the overflow bit to flag.\n\t" + writesAfterPublish.toString() );
        for( w=0; w<WRITE_VALUES_NEEDED; w++ )
        {
            item.SafelySetValueTypeKnown( writesAfterPublish[w], detectedDataType );
            WriteHelper.Execute( item );
            // wait one cycle before moving on... i.e. let server POLL this value 
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
        }// for w...

        // call Publish again and check for the overflow status bits
        if( PublishHelper.Execute() )
        {
            AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected 0% deadband to yield the dataChange results that echo the values written." );
            AssertEqual( QUEUESIZE, PublishHelper.CurrentDataChanges[0].MonitoredItems.size, "Expected to receive the same number of dataChanges as our Queue is long!" );

            // now to compare the values received with those written
            print( "\n\n\n\n\nChecking Publish notifications match the writes (checking for overflow). The values written include: " + writesAfterPublish.toString() );
            PublishHelper.PrintDataChanges();
            for( var c=0; c<QUEUESIZE; c++ ) //c for Compare
            {
                AssertCoercedEqual( writesAfterPublish[c], PublishHelper.CurrentDataChanges[0].MonitoredItems[c].Value.Value, "Expected the same value to be received as was written." );
            }

            // check the statusCode overflow bit
            AssertEqual( StatusCode.Good | OVERFLOWBIT, PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.StatusCode.StatusCode, "First item's StatusCode overflow bit is not active, even though a value was lost from the queue!" );
        }
    }
    // clean-up
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems612004 );