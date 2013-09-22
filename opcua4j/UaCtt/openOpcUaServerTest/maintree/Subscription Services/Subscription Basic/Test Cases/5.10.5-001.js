/*  Test 5.10.5 Test 1 prepared by Matthias Isele; matthias.isele@ascolab.com
    Description:
        Republish using default parameters.
        Expected Result: Service succeeds.

    Revision History
        2009-Aug-14 MI: Initial version.
        2009-Nov-24 NP: REVIEWED.
*/

function republish5105001()
{
    var i;
    var dataChangeNotification;

    // create subscription    
    var basicSubscription = new Subscription();
    createSubscription( basicSubscription, g_session );

    // create monitored items
    var MonitoredItems = [];
    var clientHandle = 0;
    MonitoredItems[0] = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("iud").name );
    MonitoredItems[1] = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("udi").name );

    if( MonitoredItems[0] === null || MonitoredItems[1] === null )
    {
        addSkipped( "Static Scalar - 2 Nodes needed" );
        return;
    }

    if( createMonitoredItems( MonitoredItems, TimestampsToReturn.Both, basicSubscription, g_session ) )
    {
        // delay to allow the server time to fetch its initial values
        wait( basicSubscription.RevisedPublishingInterval );

        // call publish to get the first sequence number
        var receivedSequenceNumbers = new IntegerSet();
        var unacknowledgedSequenceNumbers = new IntegerSet();
        var acknowledgedSequenceNumbers = new IntegerSet();

        var publishRequest = new UaPublishRequest();
        var publishResponse = new UaPublishResponse();
        g_session.buildRequestHeader( publishRequest.RequestHeader );

        var uaStatus = g_session.publish( publishRequest, publishResponse );
        var dataValue;
        if( uaStatus.isGood() )
        {
            checkPublishValidParameter( publishRequest, publishResponse );
            if( publishResponse.NotificationMessage.NotificationData.length > 0 )
            {
                dataChangeNotification = publishResponse.NotificationMessage.NotificationData[0].toDataChangeNotification();
                
                if( dataChangeNotification.MonitoredItems.length > 0 )
                {
                    dataValue = dataChangeNotification.MonitoredItems[0].Value;
                }
                else
                {
                    addError( "publish: no monitored items in DataChangeNotification" );
                }

                datachangeNotification = publishResponse.NotificationMessage.NotificationData[0].toDataChangeNotification();
                for( i = 0; i < datachangeNotification.MonitoredItems.length; i++ )
                {
                    addLog( "datachangeNotification.MonitoredItems[" + i + "] = " + datachangeNotification.MonitoredItems[i] );
                }

                // add new sequence number to list of received SequenceNumbers
                receivedSequenceNumbers.insert( publishResponse.NotificationMessage.SequenceNumber );

                // add all unacknowledged SequenceNumbers to list of unacknowledged SequenceNumbers
                for( i = 0; i < publishResponse.AvailableSequenceNumbers.length; i++ )
                {
                    unacknowledgedSequenceNumbers.insert( publishResponse.AvailableSequenceNumbers[i] );
                }// for i

                addLog( "receivedSequenceNumbers = " + receivedSequenceNumbers );
                addLog( "unacknowledgedSequenceNumbers = " + unacknowledgedSequenceNumbers );
                addLog( "acknowledgedSequenceNumbers = " + acknowledgedSequenceNumbers );

                // call republish with the sequence number received above
                var republishRequest = new UaRepublishRequest();
                var republishResponse = new UaRepublishResponse();
                g_session.buildRequestHeader( republishRequest.RequestHeader );

                republishRequest.RetransmitSequenceNumber = receivedSequenceNumbers.atIndex( 0 );
                republishRequest.SubscriptionId = basicSubscription.SubscriptionId;

                uaStatus = g_session.republish( republishRequest, republishResponse );
                if( uaStatus.isGood() )
                {
                    checkRepublishValidParameter( republishRequest, republishResponse );
                    if( republishResponse.NotificationMessage.NotificationData.length > 0 )
                    {
                        dataChangeNotification = republishResponse.NotificationMessage.NotificationData[0].toDataChangeNotification();
                        if( dataChangeNotification.MonitoredItems.length > 0 )
                        {
                            var newDataValue = dataChangeNotification.MonitoredItems[0].Value;

                            // compare if republish sent the same data that publish sent before
                            if( !newDataValue.equals( dataValue ) )
                            {
                                addError( "Data received via republish is not the same data that was received via publish before" );
                            }
                        }
                        else
                        {
                            addError( "republish: no monitored items in DataChangeNotification" );
                        }
                    }
                    else
                    {
                        addError( "republish: no NotificationData in NotificationMessage" );
                    }

                    datachangeNotification = republishResponse.NotificationMessage.NotificationData[0].toDataChangeNotification();
                    for( i  = 0; i < datachangeNotification.MonitoredItems.length; i++ )
                    {
                        addLog("datachangeNotification.MonitoredItems[" + i + "] = " + datachangeNotification.MonitoredItems[i] );
                    }
                }
                else
                {
                    addError( "Republish() status " + uaStatus, uaStatus );
            }

                addLog( "receivedSequenceNumbers = " + receivedSequenceNumbers );
                addLog( "unacknowledgedSequenceNumbers = " + unacknowledgedSequenceNumbers );
                addLog( "acknowledgedSequenceNumbers = " + acknowledgedSequenceNumbers );
            }
            else
            {
                addError( "publish: no NotificationData in NotificationMessage" );
            }// else... if NotificationMessage.NotificationData.length > 0
        }// if uaStatus is good
        else
        {
            addError( "Publish() status " + uaStatus, uaStatus );
        }
    }

    // delete the items we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s();
    var j = 0;
    for( i = 0; i< MonitoredItems.length; i++ )
    {
        if(MonitoredItems[i].IsCreated)
        {
            monitoredItemsIdsToDelete[j++] = MonitoredItems[i].MonitoredItemId;
        }
    }        
    deleteMonitoredItems( monitoredItemsIdsToDelete, basicSubscription, g_session );

    // delete the subscription we added here 
    deleteSubscription( basicSubscription, g_session );
}

safelyInvoke( republish5105001 );