/*  Test 5.10.4 Test 2, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Calls Publish while acknowledging a valid sequenceNumber on a
        valid subscription.

     How this test will work:
        1) setup the subscription and monitored item
        2) call publish a number of times (in a loop) each time validating the sequence number.
       The test will then clean up the monitoredItems etc.

    Revision History
        02-Sep-2009 NP: Initial version.
        21-Oct-2009 NP: Revised to use new script library objects.
        19-Nov-2009 NP: Revised script to meet new test-case guidelines (notably the checking of AvailableSequenceNumbers).
                        REVIEWED.
        22-Mar-2010 NP: Added "TimeoutHint" selection to the Publish helper.
*/
   
function publish5104002()
{
    const PUBLISHCALLCOUNT = 5; //how many times to call "Publish" in a loop.

    // step 1 - adding some items to subscribe to (monitor).
    // define the monitored items and then make the call to monitor them!
    var items = [
        MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("iud").name ),
        MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("udi").name )
    ];

    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar - 2 items needed" );
        return;
    }

    // step 2 - create the subscription.
    basicSubscription = new Subscription();
    if( !createSubscription( basicSubscription, g_session ) )
    {
        return;
    }

    // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
    if( createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription, g_session ) )
    {
        // wait for 1 publish interval to allow the monitoredItems to be polled.
        print( "Waiting " + basicSubscription.RevisedPublishingInterval + " msecs (1 publishingInterval) before calling Publish()" );
        wait( basicSubscription.RevisedPublishingInterval );

        publishService.Execute(); // initial dataChange
        publishService.Execute(); // acknowledge receipt of above

        deleteMonitoredItems(items, basicSubscription, g_session)
    }
    // delete the subscription we added here 
    deleteSubscription( basicSubscription, g_session );
    publishService.Clear();
}

safelyInvoke( publish5104002 );