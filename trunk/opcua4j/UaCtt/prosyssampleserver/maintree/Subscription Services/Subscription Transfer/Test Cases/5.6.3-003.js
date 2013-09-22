/*  Test CloseSession 5.6.3 Test #3 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        CloseSession while specifying DeleteSubscriptions=FALSE.
        Create a subscription with 1 monitored item.
        When the session is closed, we are JUST going to close the Session.
        The subscription and monitoredItem will NOT be cleaned-up.
        We'll then create another session.
        We'll try to TRANSFER the subscription to the new session.
        We're expecting the subscription to be present!

        We ARE checking if TransferSubscription is Bad_NotImplemented. If so, then
        the test result is a Warning with a message of Inconclusive.

    Revision History
        06-Oct-2009 NP: Initial version.
        24-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server doesn't support TransferSubscriptions.
        11-Feb-2011 DP: Fixed script to call TransferSubscriptions correctly, and to
                        validate the transfer with a Publish call.
*/

function closeSession563003()
{
    var setting1 = readSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" ).name ).toString();
    if( setting1 === "" )
    {
        addSkipped( "Dynamic Scalar NodeId1" );
        return;
    }

    const DELAYBEFOREPUBLISH = 1500;
    var uaStatus;

    // the subscriptionId will be set by our subscription, and used to try and TransferSubscription
    var subscriptionId = -1;

    // Connect to the server 
    var session = new UaSession( g_channel );
    if( createSession( session ) && activateSession( session ) )
    {
        // create a subscription...
        var basicSubscription = new Subscription();
        if( createSubscription( basicSubscription, session ) )
        {
            // record the subscriptionId, we'll need it later to transfer to another session
            subscriptionId = basicSubscription.SubscriptionId;

            // create a monitoredItem
            var items = [
                new MonitoredItem( UaNodeId.fromString( setting1 ), 0x0 )
                ];

            // add monitoredItem to subscription:
            if( createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription, session ) )
            {
                addLog( "Waiting '" + DELAYBEFOREPUBLISH + " msecs' before calling Publish." );
                wait( DELAYBEFOREPUBLISH );

                // call publish
                var publishRequest = new UaPublishRequest();
                var publishResponse = new UaPublishResponse();
                session.buildRequestHeader( publishRequest.RequestHeader );

                uaStatus = session.publish( publishRequest, publishResponse );
                if( uaStatus.isGood() )
                {
                    checkPublishValidParameter( publishRequest, publishResponse );
                    addLog( "DataChange count: " + publishResponse.NotificationMessage.NotificationData.length );
                }
                else
                {
                    addError( "Publish() status " + uaStatus, uaStatus );
                }
            }
        }

        addLog( "Now to close the session." );

        var closeSessionRequest = new UaCloseSessionRequest();
        var closeSessionResponse = new UaCloseSessionResponse();    
        session.buildRequestHeader( closeSessionRequest.RequestHeader );

        // the default is TO deleteSubscriptions when we close the session.
        closeSessionRequest.DeleteSubscriptions = false;
        uaStatus = session.closeSession( closeSessionRequest, closeSessionResponse );

        // check result
        if( uaStatus.isGood() )
        {
            checkCloseSessionValidParameter( closeSessionRequest, closeSessionResponse );

            // now to reconnect to the server and to try and transfer the subscription
            // to the new session.
 
            var session2 = new UaSession( g_channel );
            if( createSession( session2 ) && activateSession( session2 ) )
            {
                var tsHelper = new transferSubscriptionsHelper( session, session2, [ basicSubscription ] );
                tsHelper.Request.SendInitialValues = true;
                if( !tsHelper.ExecuteAndValidate() )
                {
                    // delete subscription added above
                    deleteSubscription( basicSubscription, session );
                    closeSession( session2 );
                    return;
                }
                
                addLog( "Subscription transferred successfully" );
                
                // publish and verify the data is returned
                var publishService = new Publish( session2 );
                publishService.Execute();
                AssertTrue( publishService.CurrentlyContainsData(), "Expect a dataChange from the subscription in the new session." );

                deleteSubscription( basicSubscription, session2 );

                // close this 2nd session
                closeSessionRequest = new UaCloseSessionRequest();
                closeSessionResponse = new UaCloseSessionResponse();    
                session2.buildRequestHeader( closeSessionRequest.RequestHeader );

                uaStatus = session2.closeSession( closeSessionRequest, closeSessionResponse );

                // check result
                if( uaStatus.isGood() )
                {
                    checkCloseSessionValidParameter( closeSessionRequest, closeSessionResponse );
                }
                else
                {
                    addError( "CloseSession status " + uaStatus, uaStatus );
                    addError( "Error closing 2nd session: " + uaStatus, uaStatus );
                }
            }
        }
    }
}

safelyInvoke( closeSession563003 );