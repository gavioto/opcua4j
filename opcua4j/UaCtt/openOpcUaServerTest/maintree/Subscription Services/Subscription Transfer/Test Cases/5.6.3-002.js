/*  Test CloseSession 5.6.3 Test #2 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        CloseSession using default parameters (deleteSubscriptions=TRUE)
        Create a subscription with 1 monitored item.
        When the session is closed, we are JUST going to close the Session.
        The subscription and monitoredItem will NOT be cleaned-up via script.
        We'll then create another session.
        We'll try to TRANSFER the subscription to the new session.
        We're expecting the subscription to be non-existent!

        We ARE checking if TransferSubscription is Bad_NotImplemented. If so, then
        the test result is a Warning with a message of Inconclusive.

    Revision History
        06-Oct-2009 NP: Initial version.
        24-Nov-2009 NP: REVIEWED/INCONCLUSIVE. UA Server does not support TransferSubscriptions.
        11-Feb-2011 DP: Fixed TransferSubscriptions validation from expecting good to expecting
                        an error (Bad_SubscriptionIdInvalid).
*/

function closeSession563002()
{
    var setting1 = readSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" ).name ).toString();
    if( setting1 === "" )
    {
        addSkipped( "Static Scalar NodeId1" );
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
                
                var publishService = new Publish( session );
                if( publishService.Execute() )
                {
                    publishService.PrintDataChanges();
                }
            }
        }

        addLog( "Now to close the session." );

        var closeSessionRequest = new UaCloseSessionRequest();
        var closeSessionResponse = new UaCloseSessionResponse();    
        session.buildRequestHeader( closeSessionRequest.RequestHeader );

        // the default is TO deleteSubscriptions when we close the session.
        closeSessionRequest.DeleteSubscriptions = true;

        uaStatus = session.closeSession( closeSessionRequest, closeSessionResponse );
        if( uaStatus.isGood() )
        {
            checkCloseSessionValidParameter( closeSessionRequest, closeSessionResponse );

            // now to reconnect to the server and to try and transfer the subscription
            // to the new session.
            var session2 = new UaSession( g_channel );
            if( createSession( session2 ) && activateSession( session2 ) )
            {
                var transferSubscriptionsRequest = new UaTransferSubscriptionsRequest();
                var transferSubscriptionsResponse = new UaTransferSubscriptionsResponse();
                session2.buildRequestHeader( transferSubscriptionsRequest.RequestHeader );

                transferSubscriptionsRequest.SendInitialValues = true;
                transferSubscriptionsRequest.SubscriptionIds[0] =  subscriptionId;    
                uaStatus = session2.transferSubscriptions( transferSubscriptionsRequest,transferSubscriptionsResponse);

                // was the transfer a success? let's see...
                if ( uaStatus.isGood() )
                {
                    var expectedOperationResults = [];
                    expectedOperationResults[0] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
                    checkTransferSubscriptionsError( transferSubscriptionsRequest, transferSubscriptionsResponse, expectedOperationResults );
                }

                // close this 2nd session
                closeSession( session2 );
            }
            else
            {
                addError( "Error creating a new session (to try transfering subscription to): " + uaStatus, uaStatus );
            }
        }
        else
        {
            addError( "CloseSession() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( closeSession563002 );