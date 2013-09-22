/*  Tests multiple subscriptions in parallel.
    All subscriptions are setup in the beginning to receive data. Publish calls are made to verify that data is 
    coming in from the Server. As each callback comes in the subscriptionId associated it with it is checked-off.
    Once all subscriptions have reported a value, then a number of subscriptions are disabled.
    More calls to Publish are made and this time we ONLY expect some subscriptions to send data.

    You specify:
        session              = session object that is already open/connected/live
        subscriptionCount    = how many subscriptions to define
        nodes                = the nodes to use for creating MonitoredItems
        mode                 = monitoring mode
        filter               = not supported yet
        queueLength          = queue length for each monitored item
        timestamps           = timestamps to return for each monitored item
        requestedScanrates   = the scanrate(s) per subscription (if array specified) or one value for all subscriptions
        subscriptionsToDisableCount = how many subscriptions to disable once all initial subscriptions received.

*/
function testParallelSubscriptions( session, subscriptionCount, nodes, mode, filter, queueLength, timestamps, requestedScanrates, subscriptionsToDisableCount )
{
    const DELAYBEFOREPUBLISH = 750;
    const MAXPUBLISHCOUNT = 10 * subscriptionCount;

    // ~~~~~~~~~~~~~~~~~ FIRST, GET OUR PARAMETERS IN ORDER FOR THE SCANRATES ~~~~~~~~~~~~~~~~~~~~~~
    if( subscriptionsToDisableCount == undefined || subscriptionsToDisableCount <= 0 )
    {
        addError( "No subscriptions to disable." );
        return;
    }

    var scanrates = [];
    if( requestedScanrates == null || requestedScanrates == undefined )
    {
        // the parameter was not specified, so default to 100.
        for( var s=0; s<subscriptionCount; s++ )
        {
            scanrates[s] = 100;
        }
    }
    else if( requestedScanrates.length == undefined && requestedScanrates != null )
    {
        // not an array, but use the value to build our array
        for( var s=0; s<subscriptionCount; s++ )
        {
            scanrates[s] = requestedScanrates;
        }
    }
    else
    {
        if( requestedScanrates.length >= subscriptionCount )
        {
            for( var s=0; s<subscriptionCount; s++ )
            {
                scanrates[s] = requestedScanrates[s];
            }
        }
        else
        {
            throw( "RequestedScanrates length does not match the subscriptionCount" );
        }
    }


    // holder of the subscription objects
    var subscriptions = [];
    var createMonitoredItemsRequest = [];
    var createMonitoredItemsResponse = [];
    
    
    // will be populated by Publish, to indicate subscription is received
    var subscriptionsReceived = new IntegerSet();


    if( subscriptionCount <= 0 )  subscriptionCount = 1;
    if( subscriptionCount > 500 ) subscriptionCount = 500;
    
    addLog( "\nCreate monitored Items: Mode: " + mode
        + "; Filter: " + filter
        + "; QueueSize: " + queueLength
        + "; Timestamps to return: " + timestamps.toString() 
        + "\n" );


    // ~~~~~~~~~~~~~~ CREATE THE REQUIRED NUMBER OF SUBSCRIPTIONS WITH NODES SPECIFIED ~~~~~~~~~~~~~~~~
    // create the required number of subscriptions
    for( var s=0; s<subscriptionCount; s++ )
    {

        subscriptions[s] = new Subscription( scanrates[s], true );  
        if( createSubscription( subscriptions[s], session ) )
        {

            // add one monitored item using default parameters
            createMonitoredItemsRequest[s] = new UaCreateMonitoredItemsRequest();
            createMonitoredItemsResponse[s] = new UaCreateMonitoredItemsResponse();
            session.buildRequestHeader( createMonitoredItemsRequest[s].RequestHeader );
            
            createMonitoredItemsRequest[s].SubscriptionId = subscriptions[s].SubscriptionId;
            createMonitoredItemsRequest[s].TimestampsToReturn = timestamps;
            
            for( var n=0; n<nodes.length; n++ )
            {
                createMonitoredItemsRequest[s].ItemsToCreate[n] = new UaMonitoredItemCreateRequest();
                createMonitoredItemsRequest[s].ItemsToCreate[n].ItemToMonitor.NodeId = nodes[n];
                createMonitoredItemsRequest[s].ItemsToCreate[n].ItemToMonitor.AttributeId = Attribute.Value;
                createMonitoredItemsRequest[s].ItemsToCreate[n].MonitoringMode = mode;
                createMonitoredItemsRequest[s].ItemsToCreate[n].RequestedParameters.ClientHandle = 0x1234;
                createMonitoredItemsRequest[s].ItemsToCreate[n].RequestedParameters.SamplingInterval = 10;
                createMonitoredItemsRequest[s].ItemsToCreate[n].RequestedParameters.QueueSize = queueLength;
                createMonitoredItemsRequest[s].ItemsToCreate[n].RequestedParameters.DiscardOldest = true;
            }
                
            var uaStatus = session.createMonitoredItems( createMonitoredItemsRequest[s], createMonitoredItemsResponse[s] );
            if( uaStatus.isGood() )
            {
                checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest[s], createMonitoredItemsResponse[s] );

                // log the subscriptionid, because we're going to check that we've received it when 
                // processing the results of a Publish() call.
                subscriptionsReceived.insert(subscriptions[s].SubscriptionId );
            }
            else
            {
                addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
                break;
            }
        }
    }// for( var s=0; s<sessionCount; s++ )


    // ~~~~~~~~~~~~~~ CALL PUBLISH TO GET BACK ALL EXPECTED SUBSCRIPTIONS ~~~~~~~~~~~~~~~~
    // next, calling Publish and verifying we get all of our subscriptions back!
    var publish = new Publish( session );
    addLog( "Waiting '" + DELAYBEFOREPUBLISH + " msecs' before calling Publish." );
    wait( DELAYBEFOREPUBLISH );

    addLog( "Awaiting these subscriptions to callback: " + subscriptionsReceived.toString() );
    
    // STEP #1, initial calls to Publish to verify we receive ALL subscriptions
    var ackSub = 0;
    var allSubscriptionsReceived = false;
    for( var p=0; p<MAXPUBLISHCOUNT; p++ )
    {
        // call publish
        print( "Publish call " + (1+p) + " of " + MAXPUBLISHCOUNT );
        if( publish.Execute() && publish.CurrentlyContainsData() )
        {
            // do we have a dataChange to look at? if not, call Publish again!
            ackSeq = publish.CurrentDataChanges[0].SubscriptionId;
            // check our array and remove this subscriptionId
            if( subscriptionsReceived.contains( ackSub ) )
            {
                subscriptionsReceived.remove( ackSub );
            }
        }
        
        // have all subscriptions been received
        print( "*\tCurrently, of the " + subscriptionCount + " Enabled subscriptions set, there are " + subscriptionsReceived.size() + " waiting to be received." );
        if( subscriptionsReceived.size() == 0 )
        {
            addLog( "** ALL SUBSCRIPTIONS RECEIVED! ***" );
            allSubscriptionsReceived = true;
            break;
        }
    }// for p...

    // ~~~~~~~~~~~~~~ DISABLE THE FIRST X SUBSCRIPTIONS ~~~~~~~~~~~~~~~~
    addLog( "\nNow to disable " + subscriptionsToDisableCount + " of " + subscriptionCount + " subscriptions." );
    var setPublishing = new SetPublishingMode( session );
    var subscriptionsToDisable = SubscriptionsToIdsArray( subscriptions );

    for( var d=0; d<subscriptionsToDisableCount; d++ )
    {
        // we're going to TRICK the system by specifying the subscriptionIDs that we 
        // DO NOT EXPECT....
        // this should cause the script to keep calling publish until the counter expires.
        // shift() = removes the first item
        var subscriptionToNotExpect = subscriptions[d].SubscriptionId;
        print( "\tAdding '" + subscriptionToNotExpect + "' to the NOT expected list." );
        subscriptionsReceived.insert( subscriptionToNotExpect );
    }

    addLog( "Subscriptions awaiting callbacks now: " + subscriptionsReceived.toString() );
    AssertEqual( true, setPublishing.Execute( subscriptionsToDisable, false ) );
    addLog( "Awaiting these subscriptions to callback: " + subscriptionsReceived.toString() );


    // Next sequence of calls to Publish are to verify that we ONLY RECEIVE callbacks from the subscriptions
    // that are enabled.
    for( var p=0; p<MAXPUBLISHCOUNT; p++ )
    {
        // call publish
        print( "Publish call " + (1+p) + " of " + MAXPUBLISHCOUNT );
        if( publish.Execute() && publish.CurrentlyContainsData() )
        {
            // do we have a dataChange to look at? if not, call Publish again!
            ackSeq = publish.CurrentDataChanges[0].SubscriptionId;
            // check our array and remove this subscriptionId
            if( subscriptionsReceived.contains( ackSub ) )
            {
                subscriptionsReceived.remove( ackSub );
            }
        }
        // have all subscriptions been received?
        addLog( "*\tCurrently, " + subscriptionCount + " DISABLED subscriptions haven't checked in, which is good!" );
        if( subscriptionsReceived.size() == 0 )
        {
            addLog( "** ALL SUBSCRIPTIONS RECEIVED! ***" );
            allSubscriptionsReceived = true;
            break;
        }
    }// for p...
    AssertEqual( false, allSubscriptionsReceived, "We did not expect the disabled subscriptions to be received." );

    // delete the subscriptions
    for( var s=0; s<subscriptionCount; s++ )
    {
        // delete the items we added in this test
        var monitoredItemsIdsToDelete = [];
        for( var i=0; i< createMonitoredItemsResponse[s].Results.length; i++ )
        {
            monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse[s].Results[i].MonitoredItemId;
        }        
        deleteMonitoredItems( monitoredItemsIdsToDelete, subscriptions[s], session );
        deleteSubscription( subscriptions[s], session );
    }
}