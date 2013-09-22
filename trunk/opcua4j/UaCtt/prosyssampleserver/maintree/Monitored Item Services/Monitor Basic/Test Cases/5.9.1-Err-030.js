/*  Test 5.9.1 Error Test 30 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create a MonitoredItem of type String. The value of the string is a number, e.g. “100”.
        Specify a DeadbandAbsolute of 10.
 
        Expected Results:
            ServiceResult = Good.
            Operation level result = Bad_FilterNotAllowed

    Revision History
        04-Dec-2009 NP: Initial Version.
*/

function createMonitoredItems591Err030()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return;
    }

    var item = MonitoredItem.fromSetting( "/Server Test/NodeIds/Static/All Profiles/Scalar/String", 0 );
    if( item !== null )
    {
        // before we create the monitored item, set the value to a numeric value 
        item.Value.Value.setString( "10" );
        if( WriteHelper.Execute( item ) )
        {
            item.Filter = Event.GetDataChangeFilter( DeadbandType.Absolute, 10, DataChangeTrigger.StatusValue );
            if( !AssertTrue( createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session, [ new ExpectedAndAcceptedResults( StatusCode.BadFilterNotAllowed ) ], true ), "Expect the filter to fail on the specified data type." ) )
            {
                // clean-up
                deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
            }
        }
    }// item!=null
    else
    {
        _dataTypeUnavailable.store( "String" );
    }
}

safelyInvoke( createMonitoredItems591Err030 );