/*  Test 5.10.4 Test 11, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Call publish and acknowledge multiple valid and invalid sequence numbers from
        multiple valid and invalid subscriptions while verifying that each subscription
        is returning an equal amount of data.

        Results expected as follows:
            ServiceResult = Good.
                results[i] = Good for valid sequence numbers
                results[i] = Bad_SequenceNumberUnknown for invalid sequence numbers
                results[i] = Bad_SubscriptionIdInvalid for invalid subscription settings

    Revision History
        14-Sep-2009 NP: Initial version.
        19-Nov-2009 NP: Revised (considerably) to meet new test-case requirements.
                        REVIEWED.
        22-Mar-2010 NP: Added "TimeoutHint" selection to the Publish header.
        03-May-2010 NP: Fixed timing issue with Publish calls.
        07-Jul-2010 NP: Specifying DataTypes of nodes. Verifying nodes are accessible.
        08-Feb-2011 DP: Increased subscription MaxKeepAliveCount to increase the size of 
                    the server's retransmission queue (to ensure the server does not
                    delete any notifications before the script acknowledges them).
        02-Aug-2011 NP: Incorporated new "Max Supported MonitoredItems" setting to restrict 
                        the number of MonitoredItems used in the subscription. Applicable to 
                        embedded devices, mostly.
                        Rewritten to use Publish helper object and hook script for error injection.
*/

var publishService;
var expectedErrors = [];

function fuzzer5104011()
{
    const FUZZER = 1000; // an offset to cause Id's to go invalid (subscription/sequenceNo etc.)
    var sequenceNumbersLength = publishService.publishRequest.SubscriptionAcknowledgements.length;
    var msg = "5.10.4-011 will modify the Publish request to inject invalid SequenceNumbers to acknowledge as follows:";
    for( var s=0; s<sequenceNumbersLength; s++ )
    {
        var subId = parseInt( publishService.publishRequest.SubscriptionAcknowledgements[s].SubscriptionId );
        var seqId = parseInt( publishService.publishRequest.SubscriptionAcknowledgements[s].SequenceNumber );
        msg += "\n\tAcknolwedgement [" + s.toString() + "] ";
        switch( s )
        {
            // 0=valid; 1=invalidSubscription; 2=invalidSequence; 3=invalidBoth; other=valid
            case 0: // valid
                msg += " (to remain unchanged) ";
                expectedErrors.push( new ExpectedAndAcceptedResults( StatusCode.Good ) );
                break;
            case 1: // invalid subscription
                subId += FUZZER;
                expectedErrors.push( new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) );
                break;
            case 2: // invalid sequence number
                seqId += FUZZER;
                expectedErrors.push( new ExpectedAndAcceptedResults( StatusCode.BadSequenceNumberUnknown ) );
                break;
            case 3: // invalid subscription and sequence
                subId += FUZZER;
                seqId += FUZZER;
                expectedErrors.push( new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid ) );
                expectedErrors[ expectedErrors.length -1 ].addExpectedResult( StatusCode.BadSequenceNumberUnknown );
                break;
            default: 
                expectedErrors.push( new ExpectedAndAcceptedResults( StatusCode.Good ) );
                break;
        }
        msg += "SubscriptionId was: " + publishService.publishRequest.SubscriptionAcknowledgements[s].SubscriptionId + "; becomes: " + subId;
        publishService.publishRequest.SubscriptionAcknowledgements[s].SubscriptionId = parseInt( subId );
        msg += "; SequenceNumber was: " + publishService.publishRequest.SubscriptionAcknowledgements[s].SequenceNumber + "; becomes: " + seqId;
        publishService.publishRequest.SubscriptionAcknowledgements[s].SequenceNumber = parseInt( seqId );
    }//for snc...
    addLog( msg );
}

function publish5104011()
{
    var items = [];               // items that we're monitoring
    var basicSubscriptions = [ new Subscription(), new Subscription() ];
    var publishCount = basicSubscriptions.length * 4;
    var maxKeepAliveCount = publishCount + 10; // ensure server's retransmission queue is big enough
    var minLifetimeCount = maxKeepAliveCount * 3;

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

    var maxMIs = parseInt( readSetting( "/Server Test/Max Supported MonitoredItems" ).toString() );
    var currMICount = 0;

    // step 1 - create the subscriptions and monitored items
    for( sc=0; sc<basicSubscriptions.length; sc++ )
    {
        // ensure server's retransmission queue is big enough
        basicSubscriptions[sc].MaxKeepAliveCount = maxKeepAliveCount;
        if( basicSubscriptions[sc].LifetimeCount < minLifetimeCount )
        {
            basicSubscriptions[sc].LifetimeCount = minLifetimeCount;
        }
        
        // step 2 - adding some items to subscribe to (monitor).
        // define the monitored items and then make the call to monitor them!
        items[sc] = MonitoredItem.fromSettings( desiredSettings, 0x0 );
        currMICount += items[sc].length;

        // check if there's a limitation with the number of items supported 
        if( maxMIs !== 0 )
        {
            if( maxMIs < currMICount )
            {
                print( "Reducing the number of items from " + currMICount + ", to: " + maxMIs );
                while( currMICount > maxMIs )
                {
                    items[sc].pop();
                    currMICount--;
                }
            }
        }

        // initiate the values of our MonitoredItems so that we can write values to them later
        if( readService.Execute( items[sc] ) == false )
        {
            return;
        }

        // test write, make sure access is ok
        if( writeService.Execute( items[sc] ) == false )
        {
            return;
        }

        if( !createSubscription( basicSubscriptions[sc], g_session ) )
        {
            return;
        }

        // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
        if( !createMonitoredItems( items[sc], TimestampsToReturn.Both, basicSubscriptions[sc], g_session ) )
        {
            deleteSubscription( basicSubscriptions[sc], g_session );
            return;
        }
    }




// --------------------------------------------------------------------------
    // step #2 - publish calls, get some sequenceNumber's buffered for later acknowledgement.
    // create the publish helper and register our two subscriptions, and hook the function to fuzz the sequences etc.
    publishService = new Publish( g_session );
    publishService.RegisterSubscription( basicSubscriptions );

    var initialValue = 0;
    for( var z=0; z<=publishCount; z++ )
    {
        // wait a publish cycle
        addLog( "Wait for '" + basicSubscriptions[0].RevisedPublishingInterval + " msecs' to allow server to actively start polling the subscribed items..." );
        wait( basicSubscriptions[0].RevisedPublishingInterval );
        print( "\nPublish call " + (1+z) + " of " + publishCount );
        // on the last call to Publish, we'll do ALL of the acknowledgements*/
        publishService.Execute( true );
        print( "z=" + z + " vs publishCount=" + publishCount );
        if( z === publishCount )
        {
            publishService.HookBeforeCall = fuzzer5104011;
            publishService.Execute( undefined, expectedErrors, true );
            publishService.HookBeforeCall = null;
        }// if last publish iteration
        else
        {
            // go ahead and issue the PUBLISH call.... and then validate the response. Do not acknowledge 
            // any sequenceNumbers though...
            publishService.Execute( true );
        }

        // do a write of values, to make sure we get a dataChange on the next call
        if( z !== publishCount )
        {
            for( sc=0; sc<basicSubscriptions.length; sc++ )
            {
                items[sc][0].SafelySetValueTypeKnown( initialValue++, NodeIdSettings.guessType( items[sc][0].NodeSetting ) );
                writeService.Execute( items[sc][0], undefined, undefined, undefined, false );
            }
        }

    }//for

    for( sc=0; sc<basicSubscriptions.length; sc++ )
    {
        deleteMonitoredItems( items[sc], basicSubscriptions[sc], g_session );
        deleteSubscription( basicSubscriptions[sc], g_session );
    }
}

safelyInvoke( publish5104011 );
publishService = null;