/*  Test 5.10.3 Test 1 prepared by Development; compliance@opcfoundation.org

    Description:
        Modifies a valid (enabled) subscription by disabling it.
        
        This script works by:
         1) creating 2 monitored items
         2) subscribing to them
         3) calling Publish once, to verify we are receiving data
         4) disabling a subscription
         5) calling Publish again, to verify we do not receive data for the disabled subscription.

    Revision History
        24-Aug-2009 DEV: Initial version.
        21-Oct-2009 NP : Revised to use new script library objects.
        17-Nov-2009 NP : REVIEWED.
        24-Dec-2009 DP: Finds a configured node setting (instead of always using Int32).
*/

function setPublishingMode5103001()
{
    const DELAYTIMER = 1000;

    var basicSubscription1 = new Subscription();
    if( createSubscription( basicSubscription1, g_session ) )
    {
        // add some monitored items to our subscription
        var node = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
        var items = [ MonitoredItem.fromSetting( node.name, 0x0 ) ];

        // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
        if( createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription1, g_session ) )
        {
            // add a delay to give UA Server time to acquire some data
            wait( DELAYTIMER );

            // call PUBLISH to make sure that we do receive data.
            if( publishService.Execute() )
            {
                if( AssertEqual( true, publishService.CurrentlyContainsData(), "We expect a DataChange" ) )
                {
                    addLog( "SetPublishMode to be disabled for subscriptionId: " + basicSubscription1.SubscriptionId );

                    // set publishing mode
                    var setPublishingModeService = new SetPublishingMode( g_session );
                    if( setPublishingModeService.Execute( basicSubscription1, false ) )
                    {
                        // Write a value to the monitoredItem
                        GenerateScalarValue( items[0].Value.Value, NodeIdSettings.guessType( items[0].NodeSetting ), 1 );
                        writeService.Execute( items );

                        // add a delay to give UA Server time to acquire some data
                        wait( DELAYTIMER );

                        // LAST STEP: Call Publish again, this time we expect no data!
                        if( publishService.Execute() )
                        {
                            AssertEqual( false, publishService.CurrentlyContainsData(), "We DO NOT expect DataChanges" );
                        }
                    }
                }
            }
            // delete the monitoredItems
            deleteMonitoredItems( items, basicSubscription1, g_session );
        }// if createMonItems
    }
    // delete all subscriptions added above
    deleteSubscription( basicSubscription1, g_session );
    publishService.Clear();
}

safelyInvoke( setPublishingMode5103001 );