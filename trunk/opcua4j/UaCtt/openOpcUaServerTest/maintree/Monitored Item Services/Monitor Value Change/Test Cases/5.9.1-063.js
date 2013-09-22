/*  Test 5.9.1 Test 63 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create one monitored item with Filter = DataChangeFilter( deadbandType = None,
        trigger = StatusValueTimestamp ). Call Publish. Write a value to the Value attribute.
        Call Publish. Write a status code to the Value attribute (don’t change the value of the
        Value attribute). Call Publish. Write the existing value and status code to the Value
        attribute. Call Publish.
    Expected results:
        All service and operation level results are Good. The second Publish contains a
        DataChangeNotification with a value.value matching the written value. The third Publish
        contains a DataChangeNotification with a value.statusCode matching the written value 
        (and value.value matching the value before the write). The fourth Publish is empty.

    Revision History:
        11-Dec-2009 NP: Initial Version.
                        UA Server currently fails, no dataChange occurs when changing the statusCode only.
        23-Mar-2010 NP: Revised slightly to make sure that a VALUE is written along with Quality.
        30-Mar-2010 NP: Script now correctly handles Bad_WriteNotSupported such that remainder of script is not executed.
        09-Dec-2010 NP: Added "Bad_MonitoredItemFilterNotSupported" to CreateMonitoredItems call validation, to cause early exit of script.
        03-Feb-2011 NP: Last Publish call now does not expect dataChange (credit: MI).
        07-Mar-2011 MI: Create an own subscription for this test.
        09-Mar-2011 NP: New expectation. If a device supports timestamps then it will issue a new value. This test now
                        allows for that but verifies the timestamps differ. Likewise, it will also accept no dataChange.
        10-Mar-2011 DP: The script was moved to a new confromance unit: Changed to use 
                        MonitorBasicSubscription instead of creating a new one (having two 
                        subscriptions caused Publish confusion).
*/

function createMonitoredItems591063()
{
    // get a node of numeric type to work with
    var setting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( setting === undefined || setting == null )
    {
        _dataTypeUnavailable.store( "Static Scalar (numeric)" );
        return;
    }
    var item = MonitoredItem.fromSetting( setting.name, 0 );
    if( item == null )
    {
        addError( "Test aborted. No item available for testing." );
        return;
    }
    
    // create a subscription
    var subscription = MonitorBasicSubscription;
    
    // specify our deadband filter
    item.Filter = Event.GetDataChangeFilter( DeadbandType.None, 0, DataChangeTrigger.StatusValueTimestamp );

    // if the server doesn't support filters then permit it to return Bad_MonitoredItemFilterNotSupported.
    var expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
    expectedResults[0].addExpectedResult( StatusCode.BadMonitoredItemFilterUnsupported );

    // create the monitoredItem and add it to our existing subscription (initialize script)
    if( createMonitoredItems( item, TimestampsToReturn.Both, subscription, g_session, expectedResults, true ) )
    {
        // did we get BadMonitoredItemFilterUnsupported?
        if( createMonItemsResp.Results[0].StatusCode.StatusCode === StatusCode.BadMonitoredItemFilterUnsupported )
        {
            addNotSupported( "DataChangeEventFilter" );
        }
        else
        {
            // wait, allowing the UA Server to poll the item so we can call Publish on it
            wait( subscription.RevisedPublishingInterval);
            // call Publish #1
            if( PublishHelper.Execute() &&
                AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange notification for the initial value(s)" ) )
            {
                // get the current Value and then set a new value
                PublishHelper.SetItemValuesFromDataChange( [item] );
                var initialQuality       = item.Value.StatusCode.StatusCode;
                var initialValueAsRead   = UaVariantToSimpleType( item.Value.Value );
                
                var maxValue = getMaxValueDataType(item.Value.Value.DataType);
                var initialValueOverride;
                
                if(initialValueAsRead < maxValue)
                {
                    initialValueOverride = ( initialValueAsRead + 1 );
                }
                else
                {
                    initialValueOverride = ( initialValueAsRead - 1 );
                }
                
                // define our expected results
                expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
                expectedResults[0].addExpectedResult( StatusCode.BadWriteNotSupported );

                // set a new Value and then write it (WRITE #1)
                item.SafelySetValueTypeKnown( initialValueOverride, item.Value.Value.DataType );
                print( "\n\nWRITE #1 - new Value" );
                if( !WriteHelper.Execute( item, expectedResults, true, true ) )
                {
                    addError( "Write(): status " + WriteHelper.uaStatus, WriteHelper.uaStatus );
                }
                else
                {
                    // if we received a Bad_NotSupported then don't proceed
                    if( WriteHelper.writeResponse.Results[0].StatusCode !== StatusCode.BadWriteNotSupported )
                    {
                        // wait, allowing the UA Server to poll the item so we can call Publish on it
                        wait( subscription.RevisedPublishingInterval );
                        // call Publish #2
                        print( "\n\nPUBLISH #2 - Expecting dataChange containing last value written." );
                        if( PublishHelper.Execute() )
                        {
                            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected a dataChange because the node is configured to notify upon any kind of change (value, quality, timestamps)!" ) )
                            {
                                //check the quality and value just written, match those just received
                                AssertEqual( initialQuality, item.Value.StatusCode.StatusCode, "Expected the StatusCode to remain unchanged." );
                                if( AssertCoercedEqual( initialValueOverride, item.Value.Value, "Expected the same value to be received as just written." ) )
                                {
                                    addLog( "Publish received the value previously written (we changed the Value only)." );
                                }
                                // write a new quality code, we'll toggle from Good <> Bad
                                var initialStatusCodeAsRead = item.Value.StatusCode.StatusCode;
                                var statusCodeOverride = initialStatusCodeAsRead;
                                if( statusCodeOverride == StatusCode.Good )
                                {
                                    statusCodeOverride = StatusCode.GoodClamped;
                                }
                                else
                                {
                                    statusCodeOverride = StatusCode.Good;
                                }
                                // write the new quality code to the server (WRITE #2)
                                item.Value.StatusCode.StatusCode = statusCodeOverride;
                                print( "\n\nWRITE #2 - New StatusCode, but same Value." );
                                if( WriteHelper.Execute( item, expectedResults, true, true ) )
                                {
                                    if( WriteHelper.writeResponse.Results[0].StatusCode !== StatusCode.BadWriteNotSupported )
                                    {
                                        // wait, allowing the UA Server to poll the item so we can call Publish on it
                                        wait( subscription.RevisedPublishingInterval );
                                        // call Publish #3 again, do we get the new dataChange?
                                        print( "\n\nPUBLISH #3 - Expecting dataChange with new StatusCode" );
                                        if( PublishHelper.Execute()  &&
                                            AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange notification because the quality code changed!" ) )
                                        {
                                            PublishHelper.SetItemValuesFromDataChange( [item] );
                                            if( AssertEqual( statusCodeOverride, item.Value.StatusCode.StatusCode, "Expected the received statusCode to match the one we just wrote." ) )
                                            {
                                                addLog( "Publish received the same StatusCode as previously written." );
                                            }
                                            if( AssertCoercedEqual( initialValueOverride, item.Value.Value, "Expected the item in the dataChange to contain the same value as was first read because we haven't changed the Value yet." ) )
                                            {
                                                addLog( "Publish received the same Value as previously written." );
                                            }
                                            // store the SourceTimestamp - we will check it at the last Publish...
                                            var lastSourceTimestamp = item.Value.SourceTimestamp.clone();
                                            // last test, write the unchanged data!
                                            print( "\n\nWRITE #3 - Unchanged Data" );
                                            if( WriteHelper.Execute( item, expectedResults, true, true ) )
                                            {
                                                // wait, allowing the UA Server to poll the item so we can call Publish on it
                                                wait( subscription.RevisedPublishingInterval );
                                                // call Publish #4, dataChanges ARE expected
                                                print( "\n\nPUBLISH #4 - We MIGHT see a DataChange although the Value and StatusCode did not change!" );
                                                PublishHelper.Execute();
                                                PublishHelper.SetItemValuesFromDataChange( [item] );
                                                // WE MIGHT GET A DATACHANGE HERE!
                                                if( PublishHelper.CurrentlyContainsData() )
                                                {
                                                    addLog( "Received a DataChange. The device MUST support timestamps! Comparing the timestamp received now '" + item.Value.SourceTimestamp + "' with the timestamp received previously '" + lastSourceTimestamp + "'." );
                                                    AssertNotEqual( lastSourceTimestamp, item.Value.SourceTimestamp, "Expected an updated Source timestamp, although we previously wrote the same value and statuscode, the device was expected to receive these values and therefore update its timestamp." );
                                                }
                                                else
                                                {
                                                    addLog( "Did not receive a DataChange. The underlying device must NOT support timestamps. This is acceptable behavior. " );
                                                }
                                            }// write
                                        }// publish #3
                                    }// write not supported
                                }// write new statuscode
                            }// currentlyContainsData?
                        }// publish #2
                    }
                }// write #1
            }// publish #1

            // clean-up
            deleteMonitoredItems( item, subscription, g_session );
        }
    }// createMonitoredItems
}

safelyInvoke( createMonitoredItems591063 );