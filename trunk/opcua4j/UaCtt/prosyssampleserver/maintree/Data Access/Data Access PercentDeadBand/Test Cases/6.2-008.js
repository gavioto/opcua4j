/*  Test 6.2 Test 8 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create a subscription with a deadband set to deadbandPercent=10%.
        Write numerous values to the item where some exceed the deaband value
        nd others don’t. Call Publish. Modify the MonitoredItem to have a
        deadbandPercent=0%, i.e. remove the deadband. Issue the same writes and
        Publish() calls to verify the deadband is disabled.
    Expected results:
        All service and operation level results are successful. The initial
        calls to Publish() will yield only the data that has changed within the
        deadband threshold. After the MonitoredItem is modified the Publish()
        calls will return all values written

    Revision History:
        11-Dec-2009 NP: Initial version.
         2-Apr-2010 DP: Flag as not supported if no AnalogItem settings have been configured.
*/

/*globals addError, addNotSupported, addWarning, ArrayToFormattedString, AssertCoercedEqual,
  AssertEqual, AssertFalse, AssertTrue, createMonitoredItems, DataChangeTrigger, 
  DeadbandType, deleteMonitoredItems, Event, g_session, GetEURangeWriteValues, 
  GetNodeIdEURange, ModifyMIsHelper, MonitorBasicSubscription, MonitoredItem,
  NodeIdSettings, print, PublishHelper, ReadHelper, safelyInvoke, TimestampsToReturn, wait,
  WriteHelper
*/


function createMonitoredItems612008()
{
    var settings = NodeIdSettings.DAStaticAnalog();
    var item = MonitoredItem.fromSettings( settings, 0 )[0];
    if( item === undefined )
    {
        addSkipped( "Static Analog" );
        return;
    }

    var deadbandValue = 10;
    //const QUEUESIZE = 1;

    // before we do the test, read the analogType so that we can figure out
    // the data-type of the node. We'll need this information so that we can
    // properly specify the value that we'll WRITE to when seeing if the deadband
    // filters the write or not.
    if( ReadHelper.Execute( item ) )
    {
        // get the EURange, and generate some values to write to test the deadband
        var eurange = GetNodeIdEURange( item.NodeSetting );
        if( eurange === null || eurange === undefined )
        {
            addError( "Test aborted: Setting '" + item.NodeSetting + "' did not yield a valid nodeId to test." );
            return;
        }
        //var getEURangeSize = GetEURangeAsSize( eurange );
        var writesToPass = GetEURangeWriteValues( 3, eurange, deadbandValue, true,  eurange.Low );
        var writesToFail = GetEURangeWriteValues( 3, eurange, deadbandValue, false, writesToPass[writesToPass.length-1] );

        // create the monitoredItem
        item.Filter = Event.GetDataChangeFilter( DeadbandType.Percent, deadbandValue, DataChangeTrigger.StatusValue );
        if( !createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
        {
            addError( "Test aborted: Could not monitor the node specified by " + item.NodeSetting + "." );
            return;
        }

        // test the 10% deadband by writing our values expect to PASS
        print( "\n\n\n~~~~~~~~~~~~~ Deadband testing: values expected to PASS ~~~~~~~~~~~~~~~~~" );
        var w;
        for( w=0; w<writesToPass.length; w++ )
        {
            // set the value, wait to allow UA server to poll the new value
            item.SafelySetValueTypeKnown( writesToPass[w], item.Value.Value.DataType );
            WriteHelper.Execute( item );
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            PublishHelper.SetItemValuesFromDataChange( item );
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange for a value expected to exceed the deadband." ) )
            {
                AssertCoercedEqual( writesToPass[w], item.Value.Value, "Expected to receive the value we just wrote." );
            }
        }

        var publishCountBeforeFailTest = PublishHelper.ReceivedDataChanges.length;
        // test the 10% deadband by writing our values expect to FAIL
        print( "\n\n\n~~~~~~~~~~~~~ Deadband testing: values expected to FAIL ~~~~~~~~~~~~~~~~~" );
        for( w=0; w<writesToFail.length; w++ )
        {
            // set the value, wait to allow UA server to poll the new value
            item.SafelySetValueTypeKnown( writesToFail[w], item.Value.Value.DataType );
            WriteHelper.Execute( item );
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            PublishHelper.SetItemValuesFromDataChange( item );
            AssertFalse( PublishHelper.CurrentlyContainsData(), "Did not expect to receive a dataChange for a value expected to stay within the bounds of the deadband." );
        }
        AssertEqual( publishCountBeforeFailTest, PublishHelper.ReceivedDataChanges.length, "Expected the number of DataChanges to remain the same since the values written should've filtered by the deadband." );

        // now switch it all over to 0% deadband
        deadbandValue = 0;
        item.Filter = Event.GetDataChangeFilter( DeadbandType.Percent, deadbandValue, DataChangeTrigger.StatusValue );

        // modify the monitoredItem to use 0% deadband
        if( ModifyMIsHelper.Execute( item, TimestampsToReturn.Both, MonitorBasicSubscription ) )
        {
            // test the 0% deadband by writing our values expect to PASS
            print( "\n\n\n~~~~~~~~~~~~~ Deadband testing: values expected to PASS (previously would've failed) ~~~~~~~~~~~~~~~~~" );
            for( w=0; w<writesToFail.length; w++ )
            {
                // set the value, wait to allow UA server to poll the new value
                item.SafelySetValueTypeKnown( writesToFail[w], item.Value.Value.DataType );
                WriteHelper.Execute( item );
                wait( MonitorBasicSubscription.RevisedPublishingInterval );
                PublishHelper.Execute();
                PublishHelper.SetItemValuesFromDataChange( item );
                if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange for a value that would've failed the previous deadband." ) )
                {
                    AssertCoercedEqual( writesToFail[w], item.Value.Value, "Expected to receive the value we just wrote." );
                }
            }
        }
    }// read
    // clean-up
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems612008 );