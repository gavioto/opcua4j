/*  Test 5.10.3 Test 4 prepared by Development; compliance@opcfoundation.org

    Description:
        Modifies a valid (disabled) subscription by disabling it (again).

        This script works by:
         1) creating 2 monitored items
         2) subscribing to them (disabled subscription)
         3) calling Publish once, to verify we are NOT receiving data
         4) enabling the subscription
         5) calling Publish again, to verify we ARE receiving data for the subscription.

    Revision History
        24-Aug-2009 DEV: Initial version
        22-Oct-2009 NP : Upgraded script to use new script library functions.
        17-Nov-2009 NP : Added write to the static Node.
                         REVIEWED.
        25-Jan-2010 DP: Find a NodeId setting instead of using a hard-coded one.
*/

function setPublishingMode5103004()
{
    // create a DISABLED subscriptiion...
    var basicSubscription1 = new Subscription( null, false );
    if( createSubscription( basicSubscription1, g_session ) )
    {
        // add some monitored items to our subscription
        var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
        var items = [ MonitoredItem.fromSetting( nodeSetting.name, 0 ) ];

        // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
        if( createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription1, g_session ) )
        {
            // call PUBLISH to make sure that we do NOT receive data.
            wait( basicSubscription1.RevisedPublishingInterval );
            addLog( "Call PUBLISH to make sure that we DO NOT receive data." );
            if( publishService.Execute() )
            {
                if( AssertEqual( false, publishService.CurrentlyContainsData(), "We dot not expect dataChanges from a disabled subscription!" ) )
                {
                    // set publishing mode    
                    addLog( "SetPublishMode to be disabled for subscriptionId: " + basicSubscription1.SubscriptionId );
                    var setPublishingModeService = new SetPublishingMode( g_session );
                    if( setPublishingModeService.Execute( basicSubscription1, false ) )
                    {
                        // Write a value to the item, even though the subscription is disabled
                        GenerateScalarValue( items[0].Value.Value, NodeIdSettings.guessType( items[0].NodeSetting ), new Date().getSeconds() );
                        writeService.Execute( items );

                        // LAST STEP: Call Publish again, this time we expect data!
                        addLog( "Call PUBLISH to make sure that we DO NOT receive data." );
                        wait( basicSubscription1.RevisedPublishingInterval );
                        if( publishService.Execute() )
                        {
                            AssertFalse( publishService.CurrentlyContainsData(), "We do not expect the subscription to return any data." );
                        }
                    }
                }
                else
                {
                    addError( "Publish() yielded dataChange notifications when NONE were expected. NotificationMessage.NotificationData length: " + publishService.publishResponse.NotificationMessage.NotificationData.length );
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

safelyInvoke( setPublishingMode5103004 );