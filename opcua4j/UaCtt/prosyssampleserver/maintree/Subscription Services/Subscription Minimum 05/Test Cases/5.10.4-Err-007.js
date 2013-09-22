/*  Test 5.10.4 Error Test 7, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Acknowledge multiple invalid sequence numbers from multiple valid subscription.
        ServiceResult = Good.
            results[i] = Bad_SequenceNumberUnknown.

        How this test works:
            1) setup the subscription and monitored item
            2) call publish a number of times (in a loop) each time NOT validating the sequence number.
            3) each unacknowledged sequenceNumber is buffered in a variable called "receivedSequenceNumbers".
            4) after the loop is complete (see CONST PUBLISHCALLCOUNT for the loop count) all
                sequenceNumbers received multiplied (to invalidate them) and
                are sent back and acknowledged in one call.
           The test will then clean up the monitoredItems etc.

    Revision History
        09-Sep-2009 NP: Initial version.
        20-Nov-2009 NP: REVIEWED.
        22-Mar-2010 NP: Added "TimeoutHint" selection to the Publish header.
*/

function publish5104Err007()
{
    const PUBLISHCALLCOUNT = 5; //how many times to call "Publish" in a loop.
    const FUZZER = 0x0123;
    const SUBSCRIPTIONCOUNT = 3;

    var basicSubscription = [];
    var monitoredItems = [];

    // step 1 - adding some items to subscribe to (monitor).
    // define the monitored items and then make the call to monitor them!
    var items = [
        MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("iud").name, 0x0 ),
        MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("udi").name, 0x1 )
    ];

    if( items === null || items.length === 0 )
    {
        addSkipped( "Static Scalar NodeId1" );
        return;
    }

    // get the initial values for all nodes
    readService.Execute( items );

    // step 2 - create the subscriptions (incl. monitoredItems).
    var i;
    for( i=0; i<SUBSCRIPTIONCOUNT; i++ )
    {
        basicSubscription[i] = new Subscription();
        createSubscription( basicSubscription[i], g_session );

        monitoredItems[i] = [ 
            MonitoredItem.Clone( items[0] ), 
            MonitoredItem.Clone( items[1] ) ];

        // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
        createMonitoredItems( monitoredItems[i], TimestampsToReturn.Both, basicSubscription[i], g_session );
    }

    // call publish to get the first sequence number
    var receivedSequenceNumbers = new IntegerSet();
    var unacknowledgedSequenceNumbers = new IntegerSet();
    var acknowledgedSequenceNumbers = new IntegerSet();

    // publish calls, get some sequenceNumber's buffered for later acknowledgement.
    for( var z=0; z<PUBLISHCALLCOUNT; z++ )
    {
        // update each node's value to cause a dataChange
        for( i=0; i<items.length; i++ )
        {
            items[i].SafelySetValueTypeKnown( 1 + UaVariantToSimpleType(items[i].Value.Value), items[i].Value.Value.DataType );
        }//for m
        writeService.Execute( items, undefined, undefined, undefined, DO_NOT_VERIFY_WRITE );

        // wait a sampling interval, and then call Publish 
        wait( items[0].RevisedSamplingInterval );

        var publishRequest = new UaPublishRequest();
        var publishResponse = new UaPublishResponse();
        g_session.buildRequestHeader( publishRequest.RequestHeader );
        publishRequest.RequestHeader.TimeoutRequest = basicSubscription[0].TimeoutHint;

        addLog( "\nPUBLISH...(call #" + (1+z) + " of " + PUBLISHCALLCOUNT + ")" );
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
        }//if..else...
    }//for

    // now to acknowledge everything in one call
    // rebuild our request, and specify the sequence number and subscriptionId
    g_session.buildRequestHeader( publishRequest.RequestHeader );

    // acknowledge ALL of the sequenceNumbers we've received, kinda.....
    // we'll fuzz them, and also duplicate them by specifying for each
    // subscription too, which will also be fuzzed...
    var unackSize = unacknowledgedSequenceNumbers.size();
    for( var s=0; s<SUBSCRIPTIONCOUNT; s++ )
    {
        for( var i=0; i < unackSize; i++ )
        {
            addLog( "unacknowledgedSequenceNumbers[i] = " + unacknowledgedSequenceNumbers.atIndex(i) );
            publishRequest.SubscriptionAcknowledgements[i].SequenceNumber = FUZZER * unacknowledgedSequenceNumbers.atIndex(i); //injected
            publishRequest.SubscriptionAcknowledgements[i].SubscriptionId = basicSubscription[s].SubscriptionId;
        }
    }

    // call publish and acknowledging all of the sequenceNumbers received.
    addLog( "\nPublish, acknowledging INVALID sequenceNumbers: " + unacknowledgedSequenceNumbers.toString() + " for multiple invalid subscriptions..." );
    var uaStatus = g_session.publish( publishRequest, publishResponse );
    if( uaStatus.isGood() )
    {
        var expectedError = new Array(unackSize);
        for( i=0; i<unackSize; i++ )
        {
            expectedError[i] = new ExpectedAndAcceptedResults( StatusCode.BadSequenceNumberUnknown );
        }
        checkPublishError( publishRequest, publishResponse, expectedError );
    }
    else
    {
        addError( "Publish() status " + uaStatus, uaStatus );
    }

    for( var i=0; i<SUBSCRIPTIONCOUNT; i++ )
    {
        //Now Delete the MonitoredItems
        deleteMonitoredItems( monitoredItems[i], basicSubscription[i], g_session );
        // delete the subscription we added here 
        deleteSubscription( basicSubscription[i], g_session );
    }
}

safelyInvoke( publish5104Err007 );