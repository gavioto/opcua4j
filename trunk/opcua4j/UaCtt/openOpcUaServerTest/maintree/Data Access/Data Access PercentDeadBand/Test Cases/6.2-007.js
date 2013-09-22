/*  Test 6.2 Test #7, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description: 
        Modifies the first 2 monitoredItems to use a deadband filter of 99% 
        where there are 5 monitoredItems in the subscription.
        Write the EURange.High, EURange.Low and a number in the middle.
        The filtered items expect to pass the EURange.Low and EURange.High values.

    Revision History: 
        18-Dec-2009 NP: Initial Version.
         2-Apr-2010 DP: Flag as not supported if no AnalogItem settings have been configured.
*/

/*globals addError, addNotSupported, ArrayToFormattedString, AssertCoercedEqual, AssertEqual, 
  AssertFalse, AssertTrue, createMonitoredItems, DataChangeTrigger, DeadbandType, 
  deleteMonitoredItems, Event, g_session, GetEURangeAsSize, GetNodeIdEURange, 
  MonitorBasicSubscription, MonitoredItem, NodeIdSettings, print, PublishHelper, ReadHelper, 
  safelyInvoke, TimestampsToReturn, wait, WriteHelper
*/
 
function modifyMonitoredItems612007()
{
    const INITIAL_DEADBAND = 99;

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created" );
        return;
    }

    var settings = NodeIdSettings.DAStaticAnalog();
    var items = MonitoredItem.fromSettings( settings, 0 ) ;
    if( items.length === 0 )
    {
        addSkipped( "Static Analog" );
        return;
    }
    else if( items.length < 5 )
    {
        addError( "Test cannot be completed: " + items.length + " of 5 required AnalogItem nodes configured in settings (see " + ArrayToFormattedString( NodeIdSettings.GetUniqueSettingsParents( settings ), "and" ) + ")." );
        return;
    }
    else
    {
        // reduce the size down to 5 items, per the test case definition
        while( items.length > 5 )
        {
            items.pop();
        }
    }
    
    // read all the items first, to get their data-types
    if( ! ReadHelper.Execute( items ) )
    {
        return;
    }

    // we are expected a return of Good or Bad_MonitoredItemFilterInvalid, unfortunately
    // because the server MAY or MAY NOT support this. Server dependant!
    if( !createMonitoredItems( items, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        addError( "Test aborted: Could not monitor the nodes specified by " + ArrayToFormattedString( MonitoredItem.GetSettingNames( items ), "and" ) + "." );
        return;
    }

    // now get the EURanges for each AnalogItem type
    var i;
    for( i=0; i<items.length; i++ )
    {
        items[i].EURange = GetNodeIdEURange( items[i].NodeSetting );
    }

    // call Publish to make sure we get an initial dataChange
    wait( MonitorBasicSubscription.RevisedPublishingInterval );
    PublishHelper.Execute();
    if( PublishHelper.CurrentlyContainsData() == false )
    {
        addError( "Test aborted. Initial dataChange not received." );
        deleteMonitoredItems( items, MonitorBasicSubscription, g_session );
        return;
    }

    // we will now write the EURange.LOW to each item that as EURange defined
    // loop through each Item
    for( i=0; i<items.length; i++ )
    {
        // does the item have an EURange defined?
        if( items[i].EURange !== null )
        {
            /* Here's how we will do this:
                    1.) write EURange.Low, don't care about the result here
                    2.) write EURange.High, check that we receive this
                    3.) write EURange.Low,  check that we receive this
                    4.) write EURange middle value, check we DO NOT receive this */
            print( "------------ DataType: " + BuiltInType.toString( NodeIdSettings.guessType( items[i].NodeSetting ) ) + "------------" );
            print( "\tWorking on Node: '" + items[i].NodeId + "' (setting: '" + items[i].NodeSetting + "'); " );
            print( "\tSetting initial value to EURange.Low = " + items[i].EURange.Low );
            items[i].SafelySetValueTypeKnown( items[i].EURange.Low, items[i].Value.Value.DataType );
            if( !WriteHelper.Execute( items[i] ) )
            {
                addError( "Write failed for item: " + items[i].NodeId );
                continue;
            }
        }
    }

    // now to modify the first 2 items to use a DeadbandFilter
    // define the first 2 items with deadband = 99%
    for( i=0; i<2; i++ )
    {
        items[i].Filter = Event.GetDataChangeFilter( DeadbandType.Percent, INITIAL_DEADBAND, DataChangeTrigger.StatusValue );
    }
    if( !ModifyMIsHelper.Execute( [items[0], items[1]], TimestampsToReturn.Both, MonitorBasicSubscription ) )
    {
        addError( "Aborting test. Unable to modify the first two items to use a Deadband." );
        deleteMonitoredItems( items, MonitorBasicSubscription, g_session );
    }

    // call Publish to get any dataChanges
    wait( MonitorBasicSubscription.RevisedPublishingInterval );
    if( !PublishHelper.Execute() )
    {
        addError( "Publish failed after modifying items: '" + items[0].NodeId + "' and '" + items[1].NodeId + "'" );
    }

    // ONLY DO DEADBAND TESTING ON NODES THAT HAVE AN EURANGE DEFINED.
    for( i=0; i<items.length; i++ )
    {
        if( items[i].EURange !== null )
        {
            // first test of deadband, write EURange.High
            print( "\tWriting EURange.High = " + items[i].EURange.High + ", which is expected to Pass the filter!" );
            items[i].SafelySetValueTypeKnown( items[i].EURange.High, items[i].Value.Value.DataType );
            if( !WriteHelper.Execute( items[i] ) )
            {
                addError( "Write failed for item: " + items[i].NodeId );
                continue;
            }
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            if( !PublishHelper.Execute() )
            {
                addError( "Publish failed after writing to item: " + items[i].NodeId );
                continue;
            }
            if( !AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive the value we just wrote. Previous write was " + items[i].EURange.Low + ", this write was: " + items[i].EURange.High + " which should've exceeded the %" + INITIAL_DEADBAND + " deadband value." ) )
            {
                continue;
            }
            if( AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected just one dataChange notification only." ) )
            {
                AssertCoercedEqual( items[i].EURange.High, PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value, "Expected to receive the same value as previously written." );
            }
            else
            {
                // lets see what we received?
                PublishHelper.PrintDataChanges();
            }

            // second test of deadband, write EURange.Low
            print( "\tWriting EURange.Low = " + items[i].EURange.Low + ", which is expected to Pass the filter!" );
            items[i].SafelySetValueTypeKnown( items[i].EURange.Low, items[i].Value.Value.DataType );
            if( !WriteHelper.Execute( items[i] ) )
            {
                addError( "Write failed for item: " + items[i].NodeId );
                continue;
            }
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            if( !PublishHelper.Execute() )
            {
                addError( "Publish failed after writing to item: " + items[i].NodeId );
                continue;
            }
            if( !AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive the value we just wrote. Previous write was " + items[i].EURange.High + ", this write was: " + items[i].EURange.Low + " which should've exceeded the %" + INITIAL_DEADBAND + " deadband value." ) )
            {
                continue;
            }
            if( AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected just one dataChange notification only." ) )
            {
                AssertCoercedEqual( items[i].EURange.Low, PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value, "Expected to receive the same value as previously written." );
            }

            // last test of deadband, write a value in the middle of the EURange
            // if this item has a deadband, then publish should receive nothing!
            var eurangeMiddle = ( items[i].EURange.Low + GetEURangeAsSize( items[i].EURange ) / 2 );
            print( "\tWriting middle-of-the-range value = " + eurangeMiddle + ", which is expected to be filtered by the deadband!" );
            items[i].SafelySetValueTypeKnown( eurangeMiddle, items[i].Value.Value.DataType );
            if( !WriteHelper.Execute( items[i] ) )
            {
                addError( "Write failed for item: " + items[i].NodeId );
                continue;
            }
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            if( !PublishHelper.Execute() )
            {
                addError( "Publish failed after writing to item: " + items[i].NodeId );
                continue;
            }
            if( PublishHelper.CurrentlyContainsData() )
            {
                AssertTrue( items[i].Filter == null, "Item contains a deadband filter, which means a dataChange notification should not have been received." );
                PublishHelper.SetItemValuesFromDataChange( [items[i]] );
                AssertCoercedEqual( eurangeMiddle, items[i].Value.Value, "Expected to receive the same value written, even though it should've been filtered by deadband." );
            }
            else
            {
                AssertFalse( items[i].Filter == null, "No data, and no deadband. We should have received a dataChange notification." );
            }
        }// eurange defined?
    }// for i...
    
    // clean up
    deleteMonitoredItems( items, MonitorBasicSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( modifyMonitoredItems612007 );