/*  Test 5.9 # 46 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        written is to the first element of the array.
        Write a value of += 11 and then call Publish (#2).
        Write a value += 5 and then call Publish (#3).
        Write a value of -= 11 and then call Publish (#4).
        Write the same value again and then call Publish (#5).

    Expectations:
        The createMonitoredItem is successful as are all status codes.
        All writes in this test are successful.
        All data changes in received contain the entire array.
        Publish #1 yields the initial dataChange.
        Publish #2 yields the dataChange; the data matches the value written.
        Publish #3 is a keep-alive.
        Publish #4 yields the dataChange; the data matches the value written.
        Publish #5 is a keep-alive.

    Revision History
        20-Jun-2011 NP: Initial Version.
*/

function createMonitoredItems591046()
{
    var i;
    // get the Nodes to test with.. each node is of Type Array (defined in the Settings )
    var arrayItems = MonitoredItem.fromSettings( NodeIdSettings.ArraysStaticNumeric() );
    if( arrayItems.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }

    // remove Int64 because its unreliable in jscript
    for( i=0; i<arrayItems.length; i++ )
    {
        var dt = NodeIdSettings.guessType( arrayItems[i].NodeSetting );
        if( dt == BuiltInType.Int64 )
        {
            arrayItems.splice( i, 1 );
            break;
        }
    }

    // read the items first, because we will modify their values and write them back
    if( !ReadHelper.Execute( arrayItems, TimestampsToReturn.Both ) )
    {
        break;
    }
    else
    {
        // print the output, just so we have it in the record 
        for( i=0; i<arrayItems.length; i++ )
        {
            addLog( "Original reading '" + arrayItems[i].NodeSetting + "' = " + arrayItems[i].Value.Value.toString() );
        }
    }

    // define the deadbandAbs of 10
    var filter = Event.GetDataChangeFilter( DeadbandType.Absolute, 10, DataChangeTrigger.StatusValue );
    for( i=0; i<arrayItems.length; i++ )
    {
        arrayItems[i].Filter = filter;
    }//for i

    // create the monitored items
    if( createMonitoredItems( arrayItems, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        do
        {
            // wait 1 publish cycle
            wait( MonitorBasicSubscription.RevisedPublishingInterval );

// Call Publish #1, and make sure we receive data for all MonitoredItems, and that each 
// dataset received is of type array.
            PublishHelper.Execute();

            // Expectation #1: dataChange value received?
            if( !AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive initial values in our first Publish call." ) )
            {
                break;
            }
            // update our item objects with the values received in the publish
            PublishHelper.SetItemValuesFromDataChange( arrayItems, "vqstdt" );

            // allow for each write to fail with Bad_WriteNotSupported
            var expectedResults = [];
            // modify the first value of each array, just increment the value 
            addLog( "Writes #1 (of 4) - Increment [0] by 11" );
            for( i=0; i<arrayItems.length; i++ )
            {
                IncrementUaVariantArray( arrayItems[i].Value.Value, 0, 1, 11 );
                addLog( arrayItems[i].NodeSetting + " values to write: " + arrayItems[i].Value.Value.toString() );
                expectedResults[i] = new ExpectedAndAcceptedResults( StatusCode.Good );
                expectedResults[i].addExpectedResult( StatusCode.BadWriteNotSupported );
            }
            if( !WriteHelper.Execute( arrayItems, expectedResults, true ) )
            {
                // if the write did fail then exit gracefully
                for( var r=0; r<WriteHelper.writeResponse.Results.length; r++ )
                {
                    if( WriteHelper.writeResponse.Results[r] == StatusCode.BadWriteNotSupported )
                    {
                        addNotSupported( "Writing to Arrays." );
                    }
                }
                break;
            }

// Publish #2 - we expect a dataChange with our new values 
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            if( !AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected a dataChange containing the new values just written." ) )break;
            AssertEqual( arrayItems.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive the same number of items in Publish as previously written." );

// Publish #3 - write values to be filtered by deadband
            addLog( "Writes #2 (of 4) - increment [0] by 5" );
            for( i=0; i<arrayItems.length; i++ )
            {
                IncrementUaVariantArray( arrayItems[i].Value.Value, 0, 1, 5 );
                addLog( arrayItems[i].NodeSetting + " values to write: " + arrayItems[i].Value.Value.toString() );
            }
            if( !WriteHelper.Execute( arrayItems, expectedResults, true ) )
            {
                break;
            }
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            AssertFalse( PublishHelper.CurrentlyContainsData(), "Did NOT expect a dataChange because values previously written should NOT have passed the deadband filter." );

// Publish #4 - write values of -11 to each array
            addLog( "Writes #3 (of 4) - decrement [0] by 11" );
            for( i=0; i<arrayItems.length; i++ )
            {
                IncrementUaVariantArray( arrayItems[i].Value.Value, 0, 1, -16 ); // -16 because 10 + (5 previously added)
                addLog( arrayItems[i].NodeSetting + " values to write: " + arrayItems[i].Value.Value.toString() );
            }
            if( !WriteHelper.Execute( arrayItems, expectedResults, true ) )
            {
                break;
            }
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            if( !AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected a dataChange containing the new values just written." ) )
            {
                break;
            }
            AssertEqual( arrayItems.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive the same number of items in Publish as previously written." );

// Publish #5 - write same values as previously written
            addLog( "Writes #4 (of 4) - unchanged values" );
            if( !WriteHelper.Execute( arrayItems, expectedResults, true ) )break;
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            AssertFalse( PublishHelper.CurrentlyContainsData(), "Did NOT expect a dataChange because values previously written were unchanged (save values as before)." );
        }
        while( false );// do not loop, we want this so we can exit the routine easily
    }
    // clean-up
    deleteMonitoredItems( arrayItems, MonitorBasicSubscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems591046 );