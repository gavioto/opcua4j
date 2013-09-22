/*  Test 5.9.1 Test 24 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Specify an item of type array. Do this for all supported data types: 
            a. Bool         b. Byte         c. SByte        d. ByteString
            e.              f. DateTime     g.              h. Double
            i. Float        j. Guid         k. Int16        l. UInt16
            m. Int32        n. UInt32       o. Int64        p. UInt64
            q. String       r. XmlElement

        Specify an IndexRange of "2:4".

        write values to each data-type within the index range specified and then 
        call Publish.
        Write to each data-type outside of the index range (e.g.
        elements 0, 1 and 5) and then call Publish.

        We do not expect to receive data in the Publish response.

    Revision History
        15-Oct-2009 NP: Initial Version.
        16-Nov-2009 NP: Bugfixes to core library functions whose signatures had changed.
                        REVIEWED.
        25-Nov-2009 DP: Added a write to ensure the test IndexRange has elements in the array.
        02-Dec-2009 DP: Added Publish to verify write to monitored IndexRange triggers a DataChangeNotification.
        09-Dec-2009 DP: Added warning when no array items have been specified.
        01-Jul-2010 DP: Fixed number of values generated: it was generating an array with two values but writing to three indexes (2, 3, and 4).
        17-May-2011 NP: Fixed issue with Write verification not specifying an expected/accepted result per item.
        12-Jul-2011 Matthias Lechner: Fixing test in case of nodes being skipped
*/

function createMonitoredItems591024()
{
    // get the Nodes to test with.. each node is of Type Array (defined in the Settings )
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic() );
    var items = [];
    var m;
    if( monitoredItems.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }

    // capture the initial values first
    ReadHelper.Execute( monitoredItems );
    for( var i=0; i<monitoredItems.length; i++ )
    {
        // check the array length and skip arrays that are less than 5 elements 
        var nativeValue = UaVariantToSimpleType( monitoredItems[i].Value.Value );
        if( nativeValue.length < 5 )
        {
            addWarning( "Skipping Node '" + monitoredItems[i].NodeSetting + "' array length is too short." );
            continue;
        }
        else
        {
            monitoredItems[i].IndexRange = "2:4";
            items.push( monitoredItems[i] );
        }
    }

    // create the monitored items
    if( createMonitoredItems( items, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        // wait 1 publish cycle
        wait( MonitorBasicSubscription.RevisedPublishingInterval );
        
        // Call Publish, and make sure we receive data for all MonitoredItems, and that each 
        // dataset received is of type array.
        if( PublishHelper.Execute() )
        {
            // is dataChange value received of type array?
            if( PublishHelper.CurrentlyContainsData() )
            {
                print( "\nThere are " + PublishHelper.CurrentDataChanges.length + " DataChanges in the Publish Helper." );
                var d;
                for( d=0; d<PublishHelper.CurrentDataChanges.length; d++ ) // 'd' for DataChange 
                {
                    var currentDataChange = PublishHelper.CurrentDataChanges[d];
                    print( "There are " + currentDataChange.MonitoredItems.length + " MonitoredItems in the array." );
                    for( m=0; m<currentDataChange.MonitoredItems.length; m++ ) // 'm' for MonitoredItem
                    {
                        // is the value an array?
                        if( currentDataChange.MonitoredItems[m].Value.Value.getArraySize() === -1 )
                        {
                            var currentType = currentDataChange.MonitoredItems[m].Value.Value.DataType;
                            switch( currentType )
                            {
                                case BuiltInType.Byte:       break;
                                case BuiltInType.ByteString: break;
                                case BuiltInType.String:     break;
                                default:
                                    addError( "Type: " + BuiltInType.toString( currentType ) + "; Non array value received: " + currentDataChange.MonitoredItems[m].Value.toString() + 
                                        "; ClientHandle: " + currentDataChange.MonitoredItems[m].ClientHandle );
                                    break;
                            }
                        }
                    }// for m...
                }//for d...

                // using the publish() data, use it to populate our monitoredItems with their
                // data type.
                PublishHelper.SetMonitoredItemTypesFromDataChange( items );

                // allow for each write to fail with Bad_WriteNotSupported
                var expectedResults = [];
                for( var z=0; z<items.length; z++ )
                {
                    expectedResults[z] = new ExpectedAndAcceptedResults( StatusCode.Good );
                    expectedResults[z].addExpectedResult( StatusCode.BadWriteNotSupported );
                }

                // set some initial values 
                SetArrayWriteValuesInMonitoredItems( items, 3, 24, true );
                if( WriteHelper.Execute( items, expectedResults, true ) )
                {
                    // Now, WRITE to the items
                    // first, lets' create set some values within the MonitoredItems 
                    SetArrayWriteValuesInMonitoredItems( items, 3, 24 );

                    WriteHelper.Execute( items, expectedResults, true );
                    // we'll check the first result because if its bad, then the remainder will 
                    // likely be bad too...
                    if( WriteHelper.writeResponse.Results[0].isGood() )
                    {
                        // wait 1 publish cycle
                        wait( MonitorBasicSubscription.RevisedPublishingInterval );
                        // verify that a DataChangeNotification occurred after writing
                        // to the monitored indexes
                        PublishHelper.Execute();
                        AssertTrue( PublishHelper.CurrentlyContainsData(), "We expected a DataChange within the Publish response (after writing to the monitored IndexRange)." );

                        // first, we are going to change the indexRange defined in our 
                        // monitoredItem objects to "0:1", and then populate the values 
                        // so that we can call write. This will write the values to a 
                        // different segment of the array, which SHOULD NOT be 
                        // received when we call Publish.
                        for( m=0; m<monitoredItems.length; m++ ) // 'm' for MonitoredItems
                        {
                            monitoredItems[m].IndexRange = "0:1";
                        }// for m...

                        // create some values to write
                        SetArrayWriteValuesInMonitoredItems( items, 2, 25 );

                        // write the values
                        if( WriteHelper.Execute( items ) )
                        {
                            // wait 1 publish cycle
                            wait( MonitorBasicSubscription.RevisedPublishingInterval );
                            // second, now to call Publish. We DO NOT expect to receive 
                            // any dataChange callbacks because the values written are 
                            // outside of the IndexRange specified.
                            PublishHelper.Execute();
                            AssertFalse( PublishHelper.CurrentlyContainsData(), "We expected NO DataChange within the Publish response." );
                        }
                    }
                }//if write
            }//if( p.CurrentlyContainsData )
            else
            {
                addError( "No data received in callback, we expected data!" );
            }//else...if( p.CurrentlyContainsData )
        }
    }
    // clean-up
    deleteMonitoredItems( items, MonitorBasicSubscription, g_session );
    PublishHelper.Clear();
    revertOriginalValuesScalarStatic();
}

safelyInvoke( createMonitoredItems591024 );