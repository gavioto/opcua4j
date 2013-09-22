/*  Test 5.10.3 Test 3 prepared by Development; compliance@opcfoundation.org

    Description:
        Modifies a valid (enabled) subscription by enabling it (again).
        
        This script works by:
         1) creating 2 monitored items
         2) subscribing to them
         3) calling Publish once, to verify we are receiving data
         4) enabling a subscription
         5) calling Publish again, to verify we do not receive data for the disabled subscription.

    Revision History
        24-Aug-2009 DEV: Initial version.
        21-Oct-2009 NP : Upgraded script to use new script library functions.
        17-Nov-2009 NP : Added Write to the static monitoredItem.
                         REVIEWED.
        24-Dec-2009 DP: Finds a configured node setting (instead of always using Int32).
        23-Feb-2011 DP: Changed to write only a value (not VQT).
*/

function setPublishingMode5103003()
{
    // create an Enabled subscription
    var basicSubscription1 = new Subscription();
    if( createSubscription( basicSubscription1, g_session ) )
    {
        // add some monitored items to our subscription
        var node = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
        var items = [ MonitoredItem.fromSetting( node.name, 0x0 ) ];

        // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
        if( createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription1, g_session ) )
        {
            // call PUBLISH to make sure that we do receive data.
            addLog( "Call PUBLISH to make sure that we receive data." );
            wait( basicSubscription1.RevisedPublishingInterval );
            if( publishService.Execute() )
            {
                if( publishService.CurrentlyContainsData() )
                {
                    publishService.SetItemValuesFromDataChange( items );
                    publishService.PrintDataChanges();
                    addLog( "SetPublishMode to be disabled for subscriptionId: " + basicSubscription1.SubscriptionId );
                    // set publishing mode
                    var setPublishingModeService = new SetPublishingMode( g_session );
                    if( setPublishingModeService.Execute( basicSubscription1, true ) )
                    {
                        // Write a value to the node, this should cause a dataChange event to 
                        // be raised if the subscription were alive!
                        print( "\n\nWriting a value to cause a dataChange:\n\tValue originally: " + items[0].Value.Value );
                        var oldValue = items[0].Value;
                        items[0].Value = new UaDataValue();
                        items[0].SafelySetValueTypeKnown( parseInt( oldValue.Value, 10 ) + 1, oldValue.Value.DataType );
                        print( "\tValue now (before write): " + items[0].Value.Value );
                        writeService.Execute( items[0] );

                        // LAST STEP: Call Publish again, this time we expect data!
                        addLog( "Call PUBLISH to make sure that we DO receive data." );
                        wait( basicSubscription1.RevisedPublishingInterval );
                        if( publishService.Execute() )
                        {
                            AssertTrue( publishService.CurrentlyContainsData(), "We expect to receive data because we ENABLED the subscription!" );
                        }
                    }
                }
                else
                {
                    addError( "Publish() returned no dataChanges. NotificationMessage.NotificationData length: " + publishService.publishResponse.NotificationMessage.NotificationData.length );
                }
            }
            // delete the monitoredItems
            deleteMonitoredItems( items, basicSubscription1, g_session );
        }
    }
    // delete all subscriptions added above
    deleteSubscription( basicSubscription1, g_session );
    publishService.Clear();
}

safelyInvoke( setPublishingMode5103003 );