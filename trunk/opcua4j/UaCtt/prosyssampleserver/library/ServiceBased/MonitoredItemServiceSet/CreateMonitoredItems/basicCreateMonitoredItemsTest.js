function basicCreateMonitoredItemsMultipleNodes( nodes, mode, filter, queueLength, timestamps, subscriptionCount, requestedScanrates, subscriptionObjectReference )
{
    if( arguments.length < 6 )
    {
        addError( "createMonitoredItems591001 requires at least 6 arguments!" );
        return;
    }

    //const DELAYBEFOREPUBLISH = 1500;
    const MAXPUBLISHCOUNT = 10;
    
    var s; // subscription index

    // holder of scanrates for each subscription, which we'll populate based on the parameter
    var scanrates = [];
    if( requestedScanrates === null || requestedScanrates === undefined )
    {
        // the parameter was not specified, so default to 100.
        for( s=0; s<subscriptionCount; s++ )
        {
            scanrates[s] = 100;
        }
    }
    else if( requestedScanrates.length === undefined && requestedScanrates != null )
    {
        // not an array, but use the value to build our array
        for( s=0; s<subscriptionCount; s++ )
        {
            scanrates[s] = requestedScanrates;
        }
    }
    else
    {
        if( requestedScanrates.length >= subscriptionCount )
        {
            for( s=0; s<subscriptionCount; s++ )
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
    var monitoredItems = [];

    // will be populated by Publish, to indicate subscription is received
    var subscriptionsReceived = new IntegerSet();

    
    if( subscriptionCount <= 0 )  { subscriptionCount = 1; }
    if( subscriptionCount > 500 ) { subscriptionCount = 500; }
    
    addLog( "\nCreate monitored Items: Mode: " + mode +
        "; Filter: " + filter +
        "; QueueSize: " + queueLength +
        "; Timestamps to return: " + timestamps.toString() +
        "\n" );

    var createSubscriptionsSuccess = [];
    var createMonitoredItemSuccess = [];

    var publisher; // this will become a Publish helper (further down)
    // create the required number of subscriptions
    for( s=0; s<subscriptionCount; s++ )
    {
        if( subscriptionObjectReference !== undefined && subscriptionObjectReference !== null )
        {
            subscriptions[s] = subscriptionObjectReference;
        }
        else
        {
            subscriptions[s] = new Subscription( scanrates[s], true );
        }
        createSubscriptionsSuccess[s] = createSubscription( subscriptions[s], g_session );
        if( createSubscriptionsSuccess[s] )
        {
            // define our Publish service call helper instance.
            if( publisher === undefined )
            {
                publisher = new Publish( g_session, subscriptions[0].TimeoutHint );
            }
            if( nodes.length !== undefined )
            {
                monitoredItems[s] = [];
                for( var n=0; n<nodes.length; n++ )
                {
                    monitoredItems[s][n] = MonitoredItem.Clone( nodes[n] );
                }
            }
            else
            {
                monitoredItems[s] = MonitoredItem.Clone( nodes );
            }
            // create the expected results, which are to either be GOOD.
            var anticipatedResults = [];
            if( monitoredItems[s].NodeSetting !== undefined )
            {
                monitoredItems[s].MonitoringMode = mode;
                monitoredItems[s].Filter = filter;
                // specify the anticipated results
                anticipatedResults[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
            }
            else
            {
                // force all monitoredItems to use the monitoringMode specified by function parameter
                // and also the filter
                for( var m=0; m<monitoredItems[s].length; m++ )
                {
                    monitoredItems[s][m].MonitoringMode = mode;
                    monitoredItems[s][m].Filter = filter;
                    // specify the anticipated results
                    anticipatedResults[m] = new ExpectedAndAcceptedResults( StatusCode.Good );
                }//for m...
            }

            // create the monitored items
            createMonitoredItemSuccess[s] = createMonitoredItems( monitoredItems[s], TimestampsToReturn.Both, subscriptions[s], g_session, anticipatedResults, true );
            if( createMonitoredItemSuccess[s] )
            {
                // check the results of each item, make sure we have some items that can work. Since we can't remove items from the array we have to 
                // create a new array and then copy the contents to it, before overwriting our original array with the new one...
                var newMonitoredItems = [];
                if( monitoredItems[s].length === undefined )
                {
                    newMonitoredItems.push( monitoredItems[s] );
                }
                else
                {
                    for( m=0; m<monitoredItems[s].length; m++ )
                    {
                        if( createMonItemsResp.Results[m].StatusCode.StatusCode !== StatusCode.BadMonitoredItemFilterUnsupported )
                        {
                            newMonitoredItems.push( monitoredItems[s][m] );
                        }
                    }//for m...
                }
                monitoredItems[s] = newMonitoredItems;

                // do we have any items with which to test against? if not, then skip to the next iteration of this loop
                if( newMonitoredItems.length === 0 )
                {
                    addNotSupported( "DeadbandAbsolute" );
                    continue;
                }

                // we need to capture the subscription id to make sure that we have received
                // callbacks for each subscription we've created
                subscriptionsReceived.insert( subscriptions[s].SubscriptionId );
            }// createMonitoredItems
        }//createSubscription
    }//for s

    // wait one publishing cycle before calling publish
    wait( MonitorBasicSubscription.RevisedPublishingInterval );

    for( var p=0; p<MAXPUBLISHCOUNT; p++ )
    {
        publisher.Execute();

        // if we have data, then we have a subscriptionId!
        if( mode == MonitoringMode.Disabled )
        {
            if( AssertNotEqual( true, publisher.CurrentlyContainsData(), "Did not expect data changes when the monitoringMode was DISABLED." ) )
            {
                publisher.PrintDataChanges();
            }
        }
        else if( mode == MonitoringMode.Sampling )
        {
            if( AssertNotEqual( true, publisher.CurrentlyContainsData(), "Did not expect data changes when the monitoringMode was SAMPLING." ) )
            {
                publisher.PrintDataChanges();
            }
        }
        if( publisher.CurrentlyContainsData() )
        {
            var ackSub = publisher.SubscriptionIds[0];

            // check our array and remove this subscriptionId
            if( subscriptionsReceived.contains( ackSub ) )
            {
                subscriptionsReceived.remove( ackSub );
            }

            // have all subscriptions been received
            addLog( "*\tCurrently, of the " + subscriptionCount + " subscriptions set, there are " + subscriptionsReceived.size() + " waiting to be received." );
            if( subscriptionsReceived.size() === 0 )
            {
                addLog( "ALL SUBSCRIPTIONS RECEIVED!" );
                break;
            }
        }
    }// for p...

    // CLEAN UP
    // delete the subscriptions
    for( s=0; s<subscriptionCount; s++ )
    {
        if( subscriptionObjectReference !== undefined && subscriptionObjectReference !== null )
        {
            deleteMonitoredItems( monitoredItems[s], subscriptionObjectReference, g_session );
        }
        else
        {
            if( createMonitoredItemSuccess[s] )
            {
                deleteMonitoredItems( monitoredItems[s], subscriptions[s], g_session );
            }
            if( createSubscriptionsSuccess[s] )
            {
                deleteSubscription( subscriptions[s], g_session );
            }
        }
    }// for s...
}


function basicCreateMonitoredItemsTest( mode, filter, queueLength, timestamps, subscriptionObjectReference )
{
    var itemSetting = NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "diu" );
    if( itemSetting === undefined || itemSetting === null )
    {
        addSkipped( "Static Scalar" );
        return;
    }
    var items = MonitoredItem.fromSetting( itemSetting.name, 0 );
    if( items === null || items.length == 0 )
    {
        addWarning( "Unable to convert NodeId (from settings: '" + itemSetting + "') into a Monitored Item. Aborting test." );
        return;
    }
    basicCreateMonitoredItemsMultipleNodes( items, mode, filter, queueLength, timestamps, 1, subscriptionObjectReference );
}