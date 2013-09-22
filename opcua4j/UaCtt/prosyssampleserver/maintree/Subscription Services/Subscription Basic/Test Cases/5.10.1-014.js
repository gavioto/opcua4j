/*  Test 5.10.1 Test 14, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create a subscription where PublishingEnabled=FALSE.
        Verifies the publishing does not begin.

    Revision History
        08-Sep-2009 NP: Initial version.
        20-Nov-2009 NP: REVIEWED.

    How this test will work:
      1) setup the subscription and monitored item
      2) call publish a number of times (in a loop) each time validating the sequence number.

    The test will then clean up the monitoredItems etc.
*/
   
function createSubscription5101014()
{
    // step 1 - create the subscription and specify publishingEnabled=FALSE.
    basicSubscription = new Subscription( null, false );
    if( createSubscription( basicSubscription, g_session ) )
    {
        // step 2 - adding some items to subscribe to (monitor).
        // define the monitored items and then make the call to monitor them!
        var items = [
            MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("iud").name ),
            MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("udi").name )
        ];

        // create the monitored items adding them to our subscription
        if( createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription, g_session ) )
        {
            wait( basicSubscription.RevisedPublishingInterval );
            if( publishService.Execute() )
            {
                // check the NotificationData is empty.
                AssertEqual( false, publishService.CurrentlyContainsData(), "No results were expected since the subscription is disabled." );
            }
            //Now Delete the MonitoredItems
            if( !deleteMonitoredItems( items, basicSubscription, g_session ) )
            {
                addWarning( "Unable to delete the monitoredItems in the Publish test." );
            }
        }
    }
    // delete the subscription we added here 
    deleteSubscription( basicSubscription, g_session );
    publishService.Clear();
}

safelyInvoke( createSubscription5101014 );