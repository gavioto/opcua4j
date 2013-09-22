/*  Test 5.10.3 Test 14 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    
    Description:
        Enables 10 subscriptions that were previously marked as Disabled.

    Revision History
        30-Sep-2009 NP: Initial version.
        17-Nov-2009 NP: REVIEWED.
        24-Dec-2009 DP: Finds a configured node setting (instead of always using Int32).
*/

function setPublishingMode5103014()
{
    var node = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( node === undefined || node === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    var subscriptions = [ 
        new Subscription( null, false ), 
        new Subscription( null, false ), 
        new Subscription( null, false ), 
        new Subscription( null, false ), 
        new Subscription( null, false ), 
        new Subscription( null, false ), 
        new Subscription( null, false ), 
        new Subscription( null, false ), 
        new Subscription( null, false ), 
        new Subscription( null, false ) ];

    var publishCount = subscriptions.length * 2;
    var allItems     = [];
    var i;
    var maxRevisedPublishingInterval = 0;

    for( i=0; i<subscriptions.length; i++ )
    {
        if( createSubscription( subscriptions[i], g_session ) )
        {
            if(subscriptions[i].RevisedPublishingInterval > maxRevisedPublishingInterval)
            {
                maxRevisedPublishingInterval = subscriptions[i].RevisedPublishingInterval;
            }
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
    // clear the publish object's properties...
    publish.Clear();

    // set publishing mode, ENABLE ALL subscriptions
    var setPublishing = new SetPublishingMode( g_session );
    if( setPublishing.Execute( subscriptions, true ) )
    {
        // wait to ensure we get data
        wait( maxRevisedPublishingInterval );

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

safelyInvoke( setPublishingMode5103014 );