/*  Test 5.9.2 Error Test 12 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Create a MonitoredItem of type String. The value of the string is a
        number, e.g. “100”. Modify the monitoredItem and set a DeadbandAbsolute of 10.
    Expected result:
        ServiceResult = Good.
        Operation level results are Bad_FilterNotAllowed

    Revision History
        16-Dec-2009 NP: Initial Version.
*/

function modifyMonitoredItems592Err012()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created" );
        return;
    }
    var item = MonitoredItem.fromSetting( "/Server Test/NodeIds/Static/All Profiles/Scalar/String", 0, Attribute.Value );
    if( item == null )
    {
        _dataTypeUnavailable.store( "String" );
        return;
    }
    // create the monitoredItem
    if( createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session  ) )
    {
        const NUMBER_AS_STRING = "100";
        // write a value to the item, the string will receive a number.
        item.Value.Value.setString( NUMBER_AS_STRING );
        if( WriteHelper.Execute( item ) )
        {
            // call Publish to make sure the write got through
            print( "Waiting: " + MonitorBasicSubscription.RevisedPublishingInterval + " msecs, before calling Publish()" );
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            AssertTrue( publishService.Execute() && publishService.CurrentlyContainsData(), "Expected to receive a DataChange to occur because of the previous write." );
            // update the monitoredItem object with the value in the publishResponse
            publishService.SetItemValuesFromDataChange( item );
            AssertCoercedEqual( NUMBER_AS_STRING, item.Value.Value, "Expected to receive the same value as previously written." );
            
            // Now to MODIFY and specify a deadband, we're expecting error Bad_FilterNotAllowed
            var expectedResult = [ new ExpectedAndAcceptedResults( StatusCode.BadFilterNotAllowed ) ];
            item.Filter = Event.GetDataChangeFilter( DeadbandType.Absolute, 10, DataChangeTrigger.StatusValue );
            AssertTrue( ModifyMIsHelper.Execute( item, TimestampsToReturn.Both, MonitorBasicSubscription, expectedResult, true ), "Expected ModifyMonitoredItems to reject the modification." );
        }// write
    }// createMonitoredITems
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
    publishService.Clear();
}

safelyInvoke( modifyMonitoredItems592Err012 );