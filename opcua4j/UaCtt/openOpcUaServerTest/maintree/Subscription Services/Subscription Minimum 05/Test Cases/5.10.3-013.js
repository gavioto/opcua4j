/*  Test 5.10.3 Test 13 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    
    Description:
        Enables 5 subscriptions that were previously marked as Disabled.

    Revision History
        30-Sep-2009 NP: Initial version.
        17-Nov-2009 NP: Revised to meet new test-case guidelines.
                        REVIEWED.
        24-Dec-2009 DP: Finds a configured node setting (instead of always using Int32).
*/

function setPublishingMode5103013()
{
    var subscriptions = [ 
        new Subscription( null, false ), 
        new Subscription( null, false ), 
        new Subscription( null, false ), 
        new Subscription( null, false ), 
        new Subscription( null, false ) ];

    var publishCount = subscriptions.length * 2;
    var allItems     = [];
    var node = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    var i;

    for( i=0; i<subscriptions.length; i++ )
    {
        if( createSubscription( subscriptions[i], g_session ) )
        {
            // add some monitored items our subscriptions
            var items = MonitoredItem.fromSetting( node.name, 0x0 );
            if( !createMonitoredItems( items, TimestampsToReturn.Both, subscriptions[i], g_session ) )
            {
                return;
            }
            allItems[i] = items;
        }
    }

    // now to call Publish on all of these subscriptions to make sure that
    // we are NOT receiving any data change notifications...
    addLog( "Call PUBLISH to make sure that we are NOT receiving data for enabled subscriptions." );
    var publish = new Publish( g_session );
    for( i=0; i<publishCount; i++ )
    {
        publish.Execute( true ); //do not acknowledge any subscriptions
    }

    // now check which subscriptions provided dataChanges
    AssertSubscriptionCallbacks( subscriptions, publish );

    // set publishing mode, ENABLE ALL subscriptions
    var setPublishing = new SetPublishingMode( g_session );
    if( setPublishing.Execute( subscriptions, true ) )
    {
        // write to the monitoredItem
        var WriteService = new Write( g_session );
        for( i=0; i<allItems.length; i++ )
        {
            GenerateScalarValue( allItems[i].Value.Value, NodeIdSettings.guessType( allItems[i].NodeSetting ), 13 );
        }
        WriteService.Execute( allItems );

        // we'll call publish a number of times to see if we do NOT get data changes
        // for any of our subscriptions.
        publish = new Publish( g_session );
        addLog( "\nPublish to be called now a maximum of " + publishCount + " times....NO DATACHANGES EXPECTED!" );
        for( var s=0; s<publishCount; s++ )
        {
            publish.Execute( true );
        }//for s...
    }//setPublishing

    // now check which subscriptions provided dataChanges
    AssertSubscriptionCallbacks( subscriptions, publish );

    // delete all subscriptions added above
    for( i=0; i<subscriptions.length; i++ )
    {
        deleteMonitoredItems( allItems[i], subscriptions[i], g_session );
        deleteSubscription( subscriptions[i], g_session );
    }
    // clear the publish object's properties...
    publish.Clear();
}

safelyInvoke( setPublishingMode5103013 );