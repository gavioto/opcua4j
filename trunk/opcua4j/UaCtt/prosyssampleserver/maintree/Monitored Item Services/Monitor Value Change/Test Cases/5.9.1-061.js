/*  Test 5.9.1 Test 61 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create one monitored item with Filter = DataChangeFilter( deadbandType =
        None, trigger = StatusValue ). Call Publish. Write a value to the Value
        attribute. Call Publish. Write a status code to the Value attribute
        (don’t change the value of the Value attribute). Call Publish. Write the
        existing value and status code to the Value attribute. Call Publish.
    Expected results:
        All service and operation level results are Good. The second Publish
        contains a DataChangeNotification with a value.value matching the
        written value. The third Publish contains a DataChangeNotification with
        a value.statusCode matching the written value (and value.value matching
        the value before the write). The fourth Publish contains no
        DataChangeNotifications.

    Revision History:
        11-Dec-2009 NP: Initial Version.
                        UA Server currently fails, no dataChange occurs when changing the statusCode only.
        23-Mar-2010 NP: Revised slightly to make sure that a VALUE is written along with Quality.
        30-Mar-2010 NP: Script now correctly handles Bad_WriteNotSupported such that remainder of script is not executed.
                        Also correctly compares the values written to those received via Publish.
        09-Dec-2010 NP: Added "Bad_MonitoredItemFilterNotSupported" to CreateMonitoredItems call validation, to cause early exit of script.
        07-Mar-2011 MI: Create an own subscription for this test.
        10-Mar-2011 DP: The script was moved to a new confromance unit: Changed to use 
                        MonitorBasicSubscription instead of creating a new one (having two 
                        subscriptions caused Publish confusion). Replaced reference to 
                        SKIPWRITEVERIFICATION with true.
*/

function createMonitoredItems591061()
{
    // get a node of numeric type to work with
    var setting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( setting === undefined || setting == null )
    {
        _skipped( "Static Scalar (numeric)" );
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
    item.Filter = Event.GetDataChangeFilter( DeadbandType.None, 0, DataChangeTrigger.StatusValue );

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
            wait( subscription.RevisedPublishingInterval );
            // call Publish
            if( PublishHelper.Execute() &&
                AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange notification for the initial value(s)" ) )
            {
                // get the current Value and then set a new value
                PublishHelper.SetItemValuesFromDataChange( [item] );
                var initialValueAsRead  = UaVariantToSimpleType( item.Value.Value );

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

                // set a new Value and then write it (WRITE # 1)
                item.SafelySetValueTypeKnown( initialValueOverride, item.Value.Value.DataType );
                // expected write results
                expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
                expectedResults[0].addExpectedResult( StatusCode.BadWriteNotSupported );
                // clear other attributes so that we do not write them
                item.ClearVQTT( "qsd" );
                if( WriteHelper.Execute( [item], expectedResults, true, true ) )
                {
                    // if we received a Bad_NotSupported then don't proceed
                    if( WriteHelper.writeResponse.Results[0].StatusCode !== StatusCode.BadWriteNotSupported )
                    {
                        // wait, allowing the UA Server to poll the item so we can call Publish on it
                        wait( subscription.RevisedPublishingInterval );
                        // call Publish again, do we get the new dataChange?
                        if( PublishHelper.Execute() )
                        {
                            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected a dataChange when we overrode the StatusCode." ) )
                            {
                                PublishHelper.SetItemValuesFromDataChange( [item] );
                                // new value contain the same value as just written?
                                addLog("Expected " + initialValueOverride + " received " + item.Value.Value)
                                AssertTrue( ( initialValueOverride == item.Value.Value ), "Expected the item in the dataChange to contain the same value as was first read." );
        
                                // write a new quality code, we'll toggle from Good <> Bad
                                var initialStatusCodeAsRead = item.Value.StatusCode.StatusCode;
                                var statusCodeOverride = initialStatusCodeAsRead == StatusCode.Good? StatusCode.GoodClamped: StatusCode.Good;
                                // write the new quality code to the server (WRITE #2)
                                item.Value.StatusCode.StatusCode = statusCodeOverride;
                                if( WriteHelper.Execute( item, expectedResults, true, true, true ) )
                                {
                                    if( WriteHelper.writeResponse.Results[0].StatusCode !== StatusCode.BadWriteNotSupported )
                                    {
                                        // wait, allowing the UA Server to poll the item so we can call Publish on it
                                        wait( subscription.RevisedPublishingInterval );
                                        // call Publish again, do we get the new dataChange?
                                        if( PublishHelper.Execute() )
                                        {
                                            PublishHelper.SetItemValuesFromDataChange( [item] );
                                            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected a DataChange to occur when we overrode the StatusCode of the monitoredItem." ) )
                                            {
                                                AssertTrue( ( initialValueOverride == item.Value.Value ), "Expected the item in the dataChange to contain the same value as was first read because we haven't changed the Value yet." );
                                                AssertEqual( statusCodeOverride, item.Value.StatusCode.StatusCode, "Expected the received statusCode to match the one we just wrote." );
                                            }//containsData?
            
                                            // last test, write the unchanged data! (WRITE #3)
                                            if( WriteHelper.Execute( item, expectedResults, true, true ) )
                                            {
                                                // wait, allowing the UA Server to poll the item so we can call Publish on it
                                                wait( subscription.RevisedPublishingInterval );
                                                // call Publish, no dataChanges expected
                                                PublishHelper.Execute();
                                                AssertFalse( PublishHelper.CurrentlyContainsData(), "No dataChanges expected because the values we just wrote were no different to those we just read!" );
                                            }// write
                                        }// publish #3
                                    } // write not supported
                                }// write new statuscode
                            }// currentlyContainsData?
                        }// publish #2
                    }//not bad_writeNotSupported
                }// write #1
            }// publish #1
            
            // clean-up
            deleteMonitoredItems( item, subscription, g_session );
        }
    }// createMonitoredItems
}

safelyInvoke( createMonitoredItems591061 );