/*  Test 5.10.5 Test 3 prepared by Anand Taparia; ataparia@kepwaare.com
    Description:
        Script calls republish multiple X times, to obtain the last 3 X updates.
        The script accomplished this by:
        - create subscription/monitor items
        - call publish first time to get sequence number
        - repeat three times
            - send ack to the first seqeunce no. we received (only once in this loop)
            - write value
            - call publish
            - save received NotificationMessage and sequence number. Don't acknowledge.
        - repeat three times
            - call republish, with the saved sequence numbers from above (in the same order)
            - compare the published NotificationMessage to the republished NotificationMessage (should equal).

    Revision History
        21-Sep-2009 AT: Initial version.
        01-Oct-2009 AT: Reworked script based on 5.10.4-007 by Nathan Pocock.
        24-Nov-2009 NP: Revised to use new script library objects.
                        REVIEWED.
        25-Jun-2010 DP: Changed to validate the entire republished NotificationMessage instead 
                        of only the data value.
*/

function republish5105003()
{
    // define an item to subscribe to (monitor).
    var staticSetting = NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "iud" );
    if( staticSetting === undefined || staticSetting === null || staticSetting === "" )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }

    var items = [
        MonitoredItem.fromSetting( staticSetting.name )
    ];

    // read the item to get the initial value. This helps the script to set the correct 
    // value (type) when we make writes to force dataChange invocations.
    if( !readService.Execute( items ) )
    {
        addError( "Aborting test. Unable to READ the item. Therefore we can't WRITE to the item which is how we were going to invoke dataChange notifications." );
        return;
    }

    // Values we will write
    var writeValueArray = [1,22,333];
    // Flag to check if the subscription/monitored items were created successfully
    var monitorItemsCreated = false;

    // ~~~~~~~~~~ STEP 1 - CREATE THE SUBSCRIPTION ~~~~~~~~~~
    print( "\nSTEP 1 - Create the Subscription" );
    basicSubscription = new Subscription();
    if ( !createSubscription( basicSubscription, g_session ) )
    {
        return;
    }

    publishService.RegisterSubscription( basicSubscription );

    // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
    if ( !createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription, g_session ) )
    {
        deleteSubscription( basicSubscription, g_session );
        return;
    }

    // we've subscribed to monitored items, delay to give server time to fetch initial value(s)...
    print( "Waiting '" + basicSubscription.RevisedPublishingInterval + " msecs' before calling Publish." );
    wait( basicSubscription.RevisedPublishingInterval );

    // ~~~~~~~~~~ STEP 2 - INITIAL PUBLISH ~~~~~~~~~~
    // call publish to get the first sequence number
    print( "\nSTEP 2 - Call Publish (our first call) and initial data collection" );
    if( !publishService.Execute() )
    {
        deleteSubscription( basicSubscription );
        return;
    }
    publishService.PrintDataChanges();


    // ~~~~~~~~~~ STEP 3 - WRITE VALUE, CALL PUBLISH (DON'T ACKNOWLEDGE): DO THIS THREE TIMES ~~~~~~~~~~
    var retransmitSequenceNoToAck = [];
    var SendAck = true;
    var notifications = []; // the NotificationMessages from Publish for later comparison
    var writeFailed = false;
    for (var x=0; x<3; x++ )
    {
        // prepare the write call
        print( "\nSTEP 3 (iteration #" + (x+1) + ") - Write a value" );

        // set the write value
        items[0].SafelySetValueTypeKnown( writeValueArray[x], items[0].Value.Value.DataType );
        if( !writeService.Execute( items ) )
        {
            // the write failed. There's no need to continue with this test.
            addError( "The Write failed, therefore we cannot control the dataChange notifications. This test cannot be conducted. Please reconfigure the settings to use Static Read/Write nodes." );
            writeFailed = true;
            break;
        }

        // add a delay after the write, just to allow time for the write to physically take place
        print( "Waiting '" + basicSubscription.RevisedPublishingInterval + " msecs' before to allow Write to commit within the Server (just in case Server responds too soon)." );
        wait( basicSubscription.RevisedPublishingInterval );

        print( "\nSTEP 4 (iteration #" + (x+1) + ") - Call Publish, do we get our Write value?" );
        publishService.Execute( DO_NOT_ACK_SEQUENCE ); // do not acknowledge anything!
        if( publishService.CurrentlyContainsData() )
        {
            publishService.PrintDataChanges();
            notifications[x] = publishService.publishResponse.NotificationMessage;

            // make sure that we received a valueChange and that the value we received
            // matches what we wrote in Step #4.
            AssertCoercedEqual( writeValueArray[x], items[0].Value.Value, "Expected to receive the same value previously wrote." );
        }
   }
    
    // At this point we should have three unacknowledged sequence numbers. 
    // (the three unacknowledged sequence numbers respectively correspond to the three write items of writeValueArray[])
    // HOWEVER WE MIGHT NOT!!!! In the case of Embedded devices with limited resources some messages may have been
    // purged from the queue. Let's check the number of AvailableSequenceNumbers; if 3 then we're set!
    var availableSeqs = publishService.publishResponse.AvailableSequenceNumbers.length;
    if( availableSeqs !== 4 )
    {
        addSkipped( "Server PURGED notification messages from the queue; therefore we can't call REPUBLISH to obtain them. Expected 4 but received: " + availableSeqs );
    }
    else
    {

        // Now call republish to get the three numbers

        // ~~~~~~~~~~ STEP 5 - CALL REPUBLISH WITH THE UNACKNOWLEDGED SEQUENCE NUMBERS~~~~~~~~~~
        if( writeFailed === false )
        {
            for (x=0; x<3; x++ )
            {
                var seqId = publishService.ReceivedSequenceNumbers[ (publishService.ReceivedSequenceNumbers.length - 3) + x ];
                print( "\nSTEP 5 - Calling republish #" + x + " Retransmitsequence no. is: " + seqId + ". The response should have write value: " + writeValueArray[x] );
                var republishRequest = new UaRepublishRequest();
                var republishResponse = new UaRepublishResponse();
                g_session.buildRequestHeader( republishRequest.RequestHeader );

                republishRequest.RetransmitSequenceNumber = seqId;
                republishRequest.SubscriptionId = basicSubscription.SubscriptionId;

                var uaStatus = g_session.republish( republishRequest, republishResponse );
                if( uaStatus.isGood() )
                {
                    checkRepublishValidParameter( republishRequest, republishResponse );
                    AssertEqual( notifications[x], republishResponse.NotificationMessage, "Published NotificationMessage did not match Republished NotificationMessage." );
                    if( republishResponse.NotificationMessage.NotificationData.length > 0 )
                    {
                        var dataChangeNotification = republishResponse.NotificationMessage.NotificationData[0].toDataChangeNotification();
                        if(dataChangeNotification.MonitoredItems.length > 0)
                        {
                            var expectedDataChange = notifications[x].NotificationData[0].toDataChangeNotification();
                            AssertEqual( expectedDataChange, dataChangeNotification, "Published DataChangeNotification did not match Republished DataChangeNotification." );

                            var newDataValue = dataChangeNotification.MonitoredItems[0].Value.Value;
                            for( var i  = 0; i < dataChangeNotification.MonitoredItems.length; i++ )
                            {
                                print( "datachangeNotification.MonitoredItems[" + i + "] = " + dataChangeNotification.MonitoredItems[i] );
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
                }
                else
                {
                    addError( "Republish() status " + uaStatus, uaStatus );
                }
            }
        }//if writeFailed
    }//purged messages?
    //Now Delete the MonitoredItems
    deleteMonitoredItems( items, basicSubscription, g_session );
    // delete the subscription we added here 
    deleteSubscription( basicSubscription, g_session );
    publishService.UnregisterSubscription( basicSubscription );
    publishService.Clear();
}

safelyInvoke( republish5105003 );