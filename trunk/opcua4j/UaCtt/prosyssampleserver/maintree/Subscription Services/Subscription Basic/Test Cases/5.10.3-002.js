/*  Test 5.10.3 Test 2 prepared by Development; compliance@opcfoundation.org

    Description:
        Modifies a valid (disabled) subscription by enabling it.

        This script works by:
         1) creating 2 monitored items
         2) subscribing to them (disabled subscription)
         3) calling Publish once, to verify we are NOT receiving data
         4) enabling the subscription
         5) calling Publish again, to verify we ARE receiving data for the subscription.

    Revision History
        24-Aug-2009 DEV: Initial version.
        22-Oct-2009 NP : Upgraded script to use new script library functions.
        17-Nov-2009 NP : REVIEWED.
*/

function setPublishingMode5103002()
{
    // create a DISABLED subscriptiion...
    basicSubscription1 = new Subscription( null, false );
    if( createSubscription( basicSubscription1, g_session ) )
    {
        // add some monitored items to our subscription
        var items = [
            MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("iud").name )
        ];

        // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
        if( createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription1, g_session ) )
        {
            // call PUBLISH to make sure that we do NOT receive data.
            addLog( "Call PUBLISH to make sure that we DO NOT receive data." );
            if( publishService.Execute() )
            {
                if( AssertEqual( false, publishService.CurrentlyContainsData(), "Did not expect to receive data for a disabled subscription!" ) )
                {
                    // NOW to ENABLE the subscription.
                    addLog( "SetPublishMode to be disabled for subscriptionId: " + basicSubscription1.SubscriptionId );

                    // set publishing mode
                    var setPublishingModeService = new SetPublishingMode( g_session );
                    if( setPublishingModeService.Execute( [basicSubscription1], true ) )
                    {
                        // LAST STEP: Call Publish again, this time we expect data!
                        addLog( "Call PUBLISH to make sure that we DO receive data." );
                        if( publishService.Execute() )
                        {
                            AssertEqual( true, publishService.CurrentlyContainsData(), "Expected DataChanges!" );
                        }
                    }
                }
            }
            // delete the monitoredItems
            deleteMonitoredItems( items, basicSubscription1, g_session );
        }
    }
    // delete subscription added above
    deleteSubscription( basicSubscription1, g_session );
    publishService.Clear();
}

safelyInvoke( setPublishingMode5103002 );