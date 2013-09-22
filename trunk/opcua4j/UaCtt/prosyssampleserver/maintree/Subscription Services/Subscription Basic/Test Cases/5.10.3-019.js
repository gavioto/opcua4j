/*  Test 5.10.3 Test 19 prepared by Development; compliance@opcfoundation.org

    Description:
        Create a subscription (Enabled=False) monitoring a single Static monitoredItem.
        Specify the subscription 5 times in the call to SetPublishingMode where the Enabled=True.
        Write to the monitoredItem.
        Call Publish().

    Revision History
        17-Nov-2009 NP : Initial version.
                         REVIEWED.
        25-Jan-2010 DP: Find a NodeId setting instead of using a hard-coded one.
*/

function setPublishingMode5103019()
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
            addLog( "Call PUBLISH to make sure that we DO NOT receive data." );
            if( publishService.Execute() )
            {
                if( AssertEqual( false, publishService.CurrentlyContainsData(), "We dot not expect dataChanges from a disabled subscription!" ) )
                {
                    // set publishing mode    
                    addLog( "SetPublishMode to be disabled for subscriptionId: " + basicSubscription1.SubscriptionId );

                    var setPublishingModeRequest  = new UaSetPublishingModeRequest();
                    var setPublishingModeResponse = new UaSetPublishingModeResponse();
                    g_session.buildRequestHeader( setPublishingModeRequest.RequestHeader );
                    setPublishingModeRequest.PublishingEnabled = true;
                    for( var s=0; s<5; s++ )
                    {
                        print( "\tSetting subscriptionId: " + basicSubscription1.SubscriptionId + " Enabled=" + setPublishingModeRequest.PublishingEnabled );
                        setPublishingModeRequest.SubscriptionIds[s] = basicSubscription1.SubscriptionId;
                    }
                    var uaStatus = g_session.setPublishingMode( setPublishingModeRequest, setPublishingModeResponse );
                    if( uaStatus.isGood() )
                    {
                        if( checkSetPublishingModeValidParameter( setPublishingModeRequest, setPublishingModeResponse ) )
                        {
                            // we need to change the state of our subscription object
                            if( setPublishingModeResponse.Results[0].isGood() )
                            {
                                basicSubscription1.PublishingEnabled = setPublishingModeRequest.PublishingEnabled;
                            }
    
                            // Write a value to the item, even though the subscription is disabled
                            GenerateScalarValue( items[0].Value.Value, NodeIdSettings.guessType( items[0].NodeSetting ), new Date().getSeconds() );
                            writeService.Execute( items );
    
                            // LAST STEP: Call Publish again, this time we expect data!
                            addLog( "Call PUBLISH to make sure that we DO NOT receive data." );
                            publishService = new Publish( g_session );
                            if( publishService.Execute() )
                            {
                                AssertEqual( true, publishService.CurrentlyContainsData(), "We expect the subscription to return dataChanges." );
                            }
                        }
                    }
                    else
                    {
                        addError( "SetPublishingMode() status " + uaStatus );
                    }
                }
                else
                {
                    addError( "Publish() yielded dataChange notifictions when NONE were expected. NotificationMessage.NotificationData length: " + publishService.publishResponse.NotificationMessage.NotificationData.length );
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

safelyInvoke( setPublishingMode5103019 );