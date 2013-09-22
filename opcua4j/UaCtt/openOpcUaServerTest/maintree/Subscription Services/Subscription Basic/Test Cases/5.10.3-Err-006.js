/*  Test 5.10.3 Error test case 6 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Tries to Enable publishing for a mix of valid and invalid subscriptionIds.

    Revision History
        01-Sep-2009 NP: Initial version.
        21-Oct-2009 NP: Revised to use new script library objects.
        17-Nov-2009 NP: Revised to meet new test-case guidelines.
                        REVIEWED.
        25-Jan-2010 DP: Find a NodeId setting instead of using a hard-coded one.
*/

function setPublishingMode5103Err006()
{
    var subscriptions = [ 
        new Subscription( null, false ), 
        new Subscription( null, false ) ];

    var publishCount = subscriptions.length * 2;
    var allItems     = [];

    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    for( var i=0; i<subscriptions.length; i++ )
    {
        if( createSubscription( subscriptions[i], g_session ) )
        {
            // add some monitored items our subscriptions
            var items = MonitoredItem.fromSetting( nodeSetting.name, 0x0 );
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
    for( var i=0; i<publishCount; i++ )
    {
        publishService.Execute( true ); //do not acknowledge any subscriptions
    }

    // now check which subscriptions provided dataChanges
    AssertSubscriptionCallbacks( subscriptions, publishService );
    // clear the publish object's properties...
    publishService.Clear();

    // set publishing mode, DISABLE some valid and invlaid subscriptions
    var invalidSubscriptions = [ new Subscription(), subscriptions[0], new Subscription() ];
    var expectedResults = [];
    expectedResults[0] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
    expectedResults[1] = new ExpectedAndAcceptedResults( StatusCode.Good );
    expectedResults[2] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );

    var setPublishing = new SetPublishingMode( g_session );
    if( setPublishing.Execute( invalidSubscriptions, true, expectedResults, true ) )
    {
        // write to the monitoredItem
        var WriteService = new Write( g_session );
        for( var i=0; i<allItems.length; i++ )
        {
            GenerateScalarValue( allItems[i].Value.Value, NodeIdSettings.guessType( allItems[i].NodeSetting ), new Date().getSeconds() + i );
        }
        WriteService.Execute( allItems );

        // we'll call publish a number of times to see if we do NOT get data changes
        // for any of our subscriptions.
        addLog( "\nPublish to be called now a maximum of " + publishCount + " times....NO DATACHANGES EXPECTED!" );
        for( var s=0; s<publishCount; s++ )
        {
            publishService.Execute( true );
        }//for s...
    }//setPublishing

    // now check which subscriptions provided dataChanges
    AssertSubscriptionCallbacks( subscriptions, publishService );

    // delete all subscriptions added above
    for( var i=0; i<subscriptions.length; i++ )
    {
        deleteMonitoredItems( allItems[i], subscriptions[i], g_session );
        deleteSubscription( subscriptions[i], g_session );
    }
    publishService.Clear();
}

safelyInvoke( setPublishingMode5103Err006 );