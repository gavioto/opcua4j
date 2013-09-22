/*  Test 5.10.4 Test 10, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Acknowledge multiple valid and invalid sequence numbers from a valid subscription.
        ServiceResult = Good.
          for those valid requested items...
            results[i] = Good
          for those invalid requested items..
            results[i] = Bad_SequenceNumberUnknown.

    Revision History
        14-Sep-2009 NP: Initial version.
        19-Nov-2009 NP: Revised to meet the new needs of the test case.
                        REVIEWED.
        22-Mar-2010 NP: Added "TimeoutHint" selection to the Publish helper.
        07-Jul-2010 NP: Added logic to use and WRITE to STATIC nodes to better
                        control the likelihood of Publish receiving dataChange notifications.
        08-Feb-2011 DP: Increased subscription MaxKeepAliveCount to increase the size of 
                    the server's retransmission queue (to ensure the server does not
                    delete any notifications before the script acknowledges them).
        09-Mar-2011 DP: Fixed RequestHeader.TimeoutRequest to be RequestHeader.TimeoutHint.
        26-Jul-2011 NP: Rewritten to use Publish object in script library, also incorporates a "hook" method to inject the 
                        publish request by fuzzing the sequenceNumbers to acknowledge.
*/

var basicSubscription;

function fuzzPublishCall_5104010()
{
    var FUZZER = 1000;         // an "offset" we'll apply to make sequence/subscriptions ids INVALID
    var z = publishService.publishRequest.SubscriptionAcknowledgements.length;
    for( var i=0; i < z; i++ )
    {
        // modify every OTHER sequence number to acknowledge...
        if( i % 2 == 0 )
        {
            var fuzzedValue = ++FUZZER + publishService.publishRequest.SubscriptionAcknowledgements[i].SequenceNumber;
            addLog( "\tChanging SequenceNumber[" + i + "] from: " + publishService.publishRequest.SubscriptionAcknowledgements[i].SequenceNumber + "; to: " + fuzzedValue );
            publishService.publishRequest.SubscriptionAcknowledgements[i].SequenceNumber = fuzzedValue;
        }
    }
}

function publish5104010()
{
    // define the monitored items 
    var desiredSettings = [ 
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Double",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Float",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/SByte",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64" ];
    var items = MonitoredItem.fromSettings( desiredSettings );
    if( items == null || items.length < 4 )
    {
        addWarning( "Not enough Scalar nodes to test. 4 needed by minimum." );
        return;
    }
    while( items.length > 4 )
    {
        items.pop();
    }

    const PUBLISHCALLCOUNT = 5;  // how many times to call "Publish" in a loop AND write new values.

    basicSubscription = new Subscription();
    basicSubscription.MaxKeepAliveCount = PUBLISHCALLCOUNT + 10;

    // step 1 - create the subscriptions (incl. monitoredItems).
    if( !createSubscription( basicSubscription, g_session ) )
    {
        return;
    }

    // register the subscription with Publish.
    publishService.RegisterSubscription( basicSubscription );

    // step 2 - adding some items to subscribe to (monitor).

    // initiate the values of our MonitoredItems so that we can write values to them
    if( readService.Execute( items ) == false )
    {
        return;
    }

    // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
    if( !createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription, g_session ) )
    {
        deleteSubscription( basicSubscription, g_session );
        publishService.UnregisterSubscription( subscription );
        return;
    }

    // publish calls, get some sequenceNumber's buffered for later acknowledgement.
    for( var z=0; z<PUBLISHCALLCOUNT; z++ )
    {
        // write some values to our static items
        for( var i=0; i<items.length; i++ )
        {
            if( items[i].Value.Value.DataType === BuiltInType.Float )
            {
                var tmpVal = items[i].Value.Value.toFloat();
                if( isNaN( tmpVal ) )
                {
                    items[i].Value.Value.setFloat( 1 );
                }
            }
            items[i].SafelySetValueTypeKnown( items[i].Value.Value + 1, NodeIdSettings.guessType( items[i].NodeSetting ) );
        }
        writeService.Execute( items );

        // wait for a publish cycle; then call Publish() without acknowledging anything!
        addLog( "Waiting: " + basicSubscription.RevisedPublishingInterval + " msecs, before calling Publish()" );
        wait( basicSubscription.RevisedPublishingInterval );
        publishService.Execute( DO_NOT_ACK_SEQUENCE );
    }//for


    // now to acknowledge everything in one call
    // check if the server has maintained the notification messages in the queue; if it has then we can continue with the test, otherwise 
    // we can't. Embedded servers with limited resources are more likely to purge unacknowledged notification messages.
    if( publishService.publishResponse.AvailableSequenceNumbers.length < PUBLISHCALLCOUNT )
    {
        addSkipped( "Server PURGED 1 or more of the unacknowledged SequenceNumbers; we cannot conduct this test. We expected " + PUBLISHCALLCOUNT + " notifications to be available, but only " + publishService.publishResponse.AvailableSequenceNumbers.length + " are available." );
    }
    else
    {
        // prepare the expected errors
        var expectedErrors = [];
        var unackSize = publishService.UnAcknowledgedSequenceNumbers.length;
        for( i=0; i<unackSize; i++ )
        {
            if( i % 2 == 0 )
            {
                expectedErrors.push( new ExpectedAndAcceptedResults( StatusCode.BadSequenceNumberUnknown ) );
            }
            else
            {
                expectedErrors.push( new ExpectedAndAcceptedResults( StatusCode.Good ) );
            }
        }
        // temporarily attach the hook, then execute, then clear the hook: 
        publishService.HookBeforeCall = fuzzPublishCall_5104010;
        publishService.Execute( undefined, expectedErrors, true );
        publishService.HookBeforeCall = null;
    }

    //Now Delete the MonitoredItems
    deleteMonitoredItems( items, basicSubscription, g_session );
    // unregister the subscription with Publish 
    publishService.UnregisterSubscription( basicSubscription );
    // delete the subscription we added here 
    deleteSubscription( basicSubscription, g_session );
}

safelyInvoke( publish5104010 );