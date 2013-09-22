/*  Test 5.10.4 Error 2 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Calls publish with a subscriptionId=0;

    Revision History
        24-Aug-2009 NP: Initial version.
        19-Nov-2009 NP: Corrected the error-verification which expected a service fail, should be operation!
                        REVIEWED.
        22-Mar-2010 NP: Added "TimeoutHint" selection to the Publish header.
*/

function publish5104Err002()
{
    const PUBLISHCALLCOUNT = 1; //how many times to call "Publish" in a loop.

    /* How this test will work:
    1) setup the subscription and monitored item
    2) call publish a number of times (in a loop) each time validating the sequence number.

   The test will then clean up the monitoredItems etc. */

    // step 1 - create the subscription.
    basicSubscription = new Subscription();
    createSubscription( basicSubscription, g_session );


    // step 2 - adding some items to subscribe to (monitor).
    // define the monitored items and then make the call to monitor them!
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }
    while( items.length > 2 )
    {
        items.pop();
    }
    
    // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
    createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription, g_session );

    // call publish to get the first sequence number
    var receivedSequenceNumbers = new IntegerSet();
    var unacknowledgedSequenceNumbers = new IntegerSet();
    var acknowledgedSequenceNumbers = new IntegerSet();


    // publish call #1 - this will get us our initial sequenceNumber.

    var publishRequest = new UaPublishRequest();
    var publishResponse = new UaPublishResponse();
    g_session.buildRequestHeader( publishRequest.RequestHeader );
    publishRequest.RequestHeader.TimeoutRequest = basicSubscription.TimeoutHint;

    addLog( "\nInitial call to PUBLISH" );
    var uaStatus = g_session.publish( publishRequest, publishResponse );
    if( uaStatus.isGood() )
    {
        checkPublishValidParameter( publishRequest, publishResponse );

        // add our first sequence number to list of received SequenceNumbers
        receivedSequenceNumbers.insert( publishResponse.NotificationMessage.SequenceNumber );

        // add all unacknowledged SequenceNumbers to list of unacknowledged SequenceNumbers
        for( var i = 0; i < publishResponse.AvailableSequenceNumbers.length; i++ )
        {
            unacknowledgedSequenceNumbers.insert( publishResponse.AvailableSequenceNumbers[i] );
        }

        // show what we're currently buffering...
        addLog( "receivedSequenceNumbers = " + receivedSequenceNumbers );
        addLog( "unacknowledgedSequenceNumbers = " + unacknowledgedSequenceNumbers );
        addLog( "acknowledgedSequenceNumbers = " + acknowledgedSequenceNumbers );
    }
    else
    {
        addError( "Publish() status " + uaStatus, uaStatus );
    }


    /* Now go into the loop, since we have our initial sequenceNumber allowing us to get into
       the standard method of calling Publish... */
    for( var t=0; t<PUBLISHCALLCOUNT; t++ )
    {
        // rebuild our request, and specify the sequence number and subscriptionId
        g_session.buildRequestHeader( publishRequest.RequestHeader );

        // get the next sequenceNumber to acknowledge
        var size = receivedSequenceNumbers.size();
        var sequenceNumber = receivedSequenceNumbers.atIndex( size - 1 );

        // update the request by specifying the sequencenumber & subscriptionId
        publishRequest.SubscriptionAcknowledgements[0].SequenceNumber = sequenceNumber;
        publishRequest.SubscriptionAcknowledgements[0].SubscriptionId = 0; //injected error

        // call publish and acknowledge the sequenceNumber received last time.
        addLog( "\nPublish, acknowledging sequenceNumber: " + publishRequest.SubscriptionAcknowledgements[0].SequenceNumber + " for subscription: " + publishRequest.SubscriptionAcknowledgements[0].SubscriptionId );
        var uaStatus = g_session.publish( publishRequest, publishResponse );
        if( uaStatus.isGood() )
        {
            // check to see if our error is present.
            var expectedError = new ExpectedAndAcceptedResults();
            expectedError.addExpectedResult( StatusCode.BadSubscriptionIdInvalid );
            //checkPublishError( publishRequest, publishResponse, expectedError );
            checkPublishError( publishRequest, publishResponse, [ expectedError ] );
        }
        else
        {
            addError( "Publish() status " + uaStatus, uaStatus );
        }
    }

    //Now Delete the MonitoredItems
    deleteMonitoredItems( items, basicSubscription, g_session );

    // delete the subscription we added here 
    deleteSubscription( basicSubscription, g_session );
}

safelyInvoke( publish5104Err002 );