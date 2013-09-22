/*  Test 5.10.4 Test 1, prepared by Development; compliance@opcfoundation.org
    Description:
        Calls Publish using the default parameters.
    Revision History
        24-Aug-2009 DEV: Initial version
        14-Sep-2009 NP:  Added monitoredItems to the mix.
        19-Nov-2009 NP:  Added a check that 1st sequenceNumber == 1.
                         REVIEWED.
        22-Mar-2010 NP:  Added "TimeoutHint" selection to the Publish helper.
*/

function publish5104001()
{
    // step 1 - adding some items to subscribe to (monitor).
    // define the monitored items and then make the call to monitor them!
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
    if( items === null || items.length === 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    // step 2, create the subscription
    var basicSubscription = new Subscription();
    if( createSubscription( basicSubscription, g_session ) )
    {
        // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
        if(createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription, g_session ))
        {    
            addLog( "Waiting '" + basicSubscription.RevisedPublishingInterval + " msecs' (1 publish interval) before calling Publish." );
            wait( basicSubscription.RevisedPublishingInterval );

            // call publish
            publishService.Execute();

            // check the first sequenceNumber is one (1)
            print( "Checking first SequenceNumber is 1..." );
            AssertEqual( 1, publishService.publishResponse.NotificationMessage.SequenceNumber, "First SequenceNumber should be 1, always and not matter if there's a notificationMessage or not." );

            // clean-up
            deleteMonitoredItems(items, basicSubscription, g_session)
        }
    }
    deleteSubscription( basicSubscription, g_session );
    publishService.Clear();
}

safelyInvoke( publish5104001 );