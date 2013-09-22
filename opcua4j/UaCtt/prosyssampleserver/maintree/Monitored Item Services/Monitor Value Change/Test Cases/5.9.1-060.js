/*  Test 5.9.1 Test 60 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create one monitored item. Call Publish. Write a status code to the Value 
        attribute (don’t change the value of the Value attribute). Call Publish.
        Write the existing value and status code to the Value attribute. Call Publish.
    Expected results:
        All service and operation level results are Good.
        The second Publish contains a DataChangeNotification with a value.statusCode matching the written value (and value.value matching the value before the write).
        The third Publish contains no DataChangeNotifications.

    Revision History:
        11-Dec-2009 NP: Initial Version.
                        UA Server currently fails, no dataChange occurs when changing the statusCode only.
        23-Mar-2010 NP: Revised slightly to make sure that a VALUE is written along with Quality.
        30-Mar-2010 NP: Script now correctly handles Bad_WriteNotSupported such that remainder of script is not executed.
        09-Dec-2010 NP: Fixed issue where Write was not being told to look for Bad_WriteNotSupported.
        07-Mar-2011 MI: Create an own subscription for this test.
        10-Mar-2011 DP: The script was moved to a new confromance unit: Changed to use 
                        MonitorBasicSubscription instead of creating a new one (having two 
                        subscriptions caused Publish confusion).
*/

function createMonitoredItems591060()
{
    // get a node of numeric type to work with
    var setting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( setting === undefined || setting == null )
    {
        _dataTypeUnavailable.store( "Scalar Statcic (numeric)" );
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
    
    // define our expected results
    var expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
    expectedResults[0].addExpectedResult( StatusCode.BadWriteNotSupported );
    // create the monitoredItem and add it to our existing subscription (initialize script)
    if( createMonitoredItems( item, TimestampsToReturn.Both, subscription, g_session ) )
    {
        // wait, allowing the UA Server to poll the item so we can call Publish on it
        wait( subscription.RevisedPublishingInterval);
        // call Publish
        if( PublishHelper.Execute() )
        {
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected an initial dataChange for the monitoredItem" ) )
            {
                // get the current Value into our item and then store the quality
                // code, but the quality will toggle from GOOD to GoodCLAMPED.
                PublishHelper.SetItemValuesFromDataChange( [item] );
                var initialValueAsRead  = item.Value.Value;
                var statusCodeToOverride = item.Value.StatusCode.StatusCode;
                if( statusCodeToOverride == StatusCode.Good )
                {
                    statusCodeToOverride = StatusCode.GoodClamped;
                }
                else
                {
                    statusCodeToOverride = StatusCode.Good;
                }
                // now to write a StatusCode only to the item's value
                addLog( "Publish call received StatusCode '" + item.Value.StatusCode + "', will override to '" + statusCodeToOverride + "'" );
                item.Value.StatusCode.StatusCode = statusCodeToOverride;
                if( item.Value.Value.isEmpty() )
                {
                    addSkipped( "Initial value is null; cannot write only quality" );
                    deleteMonitoredItems( item, subscription, g_session );
                    PublishHelper.Clear();
                    return;
                }
                if( !WriteHelper.Execute( item, expectedResults, true, true, expectedResults, true ) )
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
                        // call Publish again, do we get the new dataChange?
                        if( PublishHelper.Execute() )
                        {
                            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected a dataChange when we overrode the StatusCode." ) )
                            {
                                PublishHelper.SetItemValuesFromDataChange( [item] );
                                // new value contain the same statusCode as just written?
                                AssertEqual( StatusCode.toString( statusCodeToOverride ), StatusCode.toString( item.Value.StatusCode ), "Expected the item in the dataChange to contain the same StatusCode as was previously written." );
                                AssertCoercedEqual( initialValueAsRead, item.Value.Value, "Expected the item in the dataChange to contain the same value as was first read. Expected: " + initialValueAsRead + "; but received: " + item.Value.Value + "." );
                                // last test, write back the current Value and StatusCode
                                item.Value.Value = initialValueAsRead;
                                item.Value.StatusCode.StatusCode = statusCodeToOverride;
                                if( WriteHelper.Execute( item, expectedResults, true, true ) )
                                {
                                    // wait, allowing the UA Server to poll the item so we can call Publish on it
                                    wait( subscription.RevisedPublishingInterval );
                                    // call Publish to get the readings. We expect no change!
                                    if( PublishHelper.Execute() )
                                    {
                                        AssertFalse( PublishHelper.CurrentlyContainsData(), "Did not expect a dataChange since the values written were the same, i.e. unchanged." );
                                    }
                                }
                                else
                                {
                                    addError( "Write(): status " + WriteHelper.uaStatus, WriteHelper.uaStatus );
                                }
                            }// currentlyContainsData?
                        }// publish
                    }
                }//write..else
            }
        }// publish #1
    }// createMonitoredItems

    // clean-up
    deleteMonitoredItems( item, subscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems591060 );