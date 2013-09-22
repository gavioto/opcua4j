/*  Test 5.9.1 Test 1, prepared by Development; compliance@opcfoundation.org
    Description:
        CreateMonitoredItems uses default parameter values.
        Expected to succeed.

        subscription is created and deleted in initialize and cleanup scripts

    Revision History
        16-Sep-2009 Dev:Initial version.
        16-Nov-2009 NP: Removed unncessary filter.
        10-Dec-2009 NP: Revised to meet new test-case requirements.
        14-Dec-2009 DP: Delete monitoredItems at the end.
        30-Nov-2010 NP: DataChange length assertion occurs ONLY IF publish contains data.
*/

function createMonitoredItems591001()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0 );
    if( createMonitoredItems( items, TimestampsToReturn.Server, MonitorBasicSubscription, g_session ) )
    {
        // wait one publishing cycle before calling publish
        wait( MonitorBasicSubscription.RevisedPublishingInterval );
        if( PublishHelper.Execute() )
        {
            if( AssertTrue ( PublishHelper.CurrentlyContainsData(), "Expected an initial dataChange! The subscription was created, we waited for one publish interval and then called Publish." ) )
            {
                AssertEqual( items.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive an initial callback for all nodes added." );
            }
        }
    }
    deleteMonitoredItems( items, MonitorBasicSubscription, g_session );
}

safelyInvoke( createMonitoredItems591001 );