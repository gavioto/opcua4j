/*  Test 5.9.5 Error Test 7 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create two subscriptions. The first subscription is empty, the other contains
        valid monitoredItems. Delete from
        the first subscription but specify the monitoredItemId of an item from the 
        second subscription.
        
        Expected results:
        Service result = Good.
        Operation = “Bad_MonitoredItemIdInvalid”.

    Revision History
        14-Oct-2009 NP: Initial Version
        03-Nov-2009 NP: Revised to use new script library objects, and to conform to new test case as revised by CMP WG.
        18-Nov-2009 NP: REVIEWED.
        17-Jun-2011 NP: Revised to temporarily delete the CU-wide subscription which ACTUALLY allows this test 
                        to use the 2 subscriptions that it specifies. Otherwise 3 subscriptions are in effect. This 
                        makes the test more embedded-friendly.
*/

function deleteMonitoredItems595Err007()
{
    var __recreateCuSubscription = false;

    // we likely have a subscription already in use from the CU, if so then delete it. We can re-create 
    // it at the end of the test...
    if( MonitorBasicSubscription.SubscriptionCreated )
    {
        deleteSubscription( MonitorBasicSubscription, g_session );
        __recreateCuSubscription = true;
    }

    //~~~~~~~~~~~~~~~~~~~ STEP 1 - CREATE 2 SUBSCRIPTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // now to define the monitoredItems, for subscription2
    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( nodeSetting === undefined || nodeSetting === null )
    {
        addWarning( "No numeric nodeIds configured for testing. Aborting test." );
        return;
    }
    var settingNames = [
        NodeIdSettings.GetAScalarStaticNodeIdSetting( "uid" ).name,
        NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" ).name,
        NodeIdSettings.GetAScalarStaticNodeIdSetting( "dui" ).name
        ];
    var items = MonitoredItem.fromSettings( settingNames, 0 );
    if( items == null || items.length != settingNames.length )
    {
        addError( "Need multiple items to perform this test. Please check the settings for these: " + settingNames.toString() );
        return;
    }

    var subscription1 = new Subscription();
    var subscription2 = new Subscription();

    if( !createSubscription( subscription1, g_session ) )
    {
        addError( "Unable to create subscription1" );
        return;
    }
    if( !createSubscription( subscription2, g_session ) )
    {
        deleteSubscription( subscription1, g_session );
        addError( "Unable to create subscription2" );
        return;
    }

    // create the monitoredItems in subscription2
    if( ! createMonitoredItems( items, TimestampsToReturn.Both, subscription2, g_session ) )
    {
        deleteSubscription( subscription1, g_session );
        deleteSubscription( subscription2, g_session );
        return;
    }



    //~~~~~~~~~~~~~~~~~~~ STEP 2 - DELETE MONITOREDITEMS ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // we are going to delete from Subscription #1 the first 2 items.
    // we are also going to specify the 3rd item from Subscription #2.
    // REMEMBER: this call should fail!
    var expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid ),
                            new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid ),
                            new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid ) ];
    AssertEqual( true, deleteMonitoredItems( items, subscription1, g_session, expectedResults, true ), "DeletedMonitoredItems to fail because the wrong subscription is specified." );

    // clean-up
    deleteMonitoredItems( items, subscription2, g_session );
    deleteSubscription( subscription1, g_session );
    deleteSubscription( subscription2, g_session );

    // restore the CU wide subscription?
    if( __recreateCuSubscription )
    {
        createSubscription( MonitorBasicSubscription, g_session );
    }
}

safelyInvoke( deleteMonitoredItems595Err007 );