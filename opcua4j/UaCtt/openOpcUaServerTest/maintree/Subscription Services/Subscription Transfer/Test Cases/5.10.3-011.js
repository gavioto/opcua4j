/*  Test 5.10.3 Test 11 prepared by Anand Taparia; ataparia@kepwaare.com
    Description:
        Script modifies the publishing mode for multiple subscriptions that were transferred.

    Revision History
        24-Sep-2009 AT: Initial version.
        17-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server does not support TransferSubscription.
        07-Dec-2009 DP: Use a library class to transferSubscriptions.
        25-Jan-2010 DP: Find a NodeId setting instead of using a hard-coded one.
        11-Feb-2011 DP: Fixed parts of script that referred to "subscription" instead of
                        "subscriptions" array.
        18-Feb-2011 NP: Changed expectation that StatusChange will be received on the OLD session.
        25-Feb-2011 DP: Fixed to match test case.
        08-Mar-2011 DP: Expect a StatusChange notification from each subscription.
*/

function transferSubscription5103011()
{
    var allItems = [];
    var subscriptions = [ new Subscription(), new Subscription() ];
    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    var s, p, i;
    if( nodeSetting === undefined || nodeSetting === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    // Create subscriptions in the first session
    for( s=0; s<subscriptions.length; s++ )
    {
        if( ! createSubscription( subscriptions[s], g_session[0] ) )
        {
            return;
        }
        // add a monitoredItem to the subscription
        var item = MonitoredItem.fromSetting( nodeSetting.name, 0 );
        item.ClientHandle = subscriptions[s].SubscriptionId;
        if( !createMonitoredItems( item, TimestampsToReturn.Both, subscriptions[s], g_session[0] ) )
        {
            return;
        }
        allItems.push( item );
    }

    // let's call Publish on the new Subscriptions to make sure that we receive initial dataChanges
    // for BOTH subscriptions.
    var session1Publish = new Publish( g_session[0] );
    wait( subscriptions[0].RevisedPublishingInterval );
    session1Publish.Execute();
    AssertTrue( session1Publish.CurrentlyContainsData(), "Expected the initial dataChange on at least one of the two Subscriptions." );
    session1Publish.Execute();
    AssertTrue( session1Publish.CurrentlyContainsData(), "Expected the initial dataChange on the other Subscription." );

    // Transfer the above subscription to the second session
    var tsHelper = new transferSubscriptionsHelper( g_session[0], g_session[1], subscriptions );
    tsHelper.Request.SendInitialValues = true;
    if( tsHelper.ExecuteAndValidate() )
    {
        // Call Publish on the OLD session, we don't expect dataChanges but DO EXPECT a statusChange
        wait( subscriptions[0].RevisedPublishingInterval );
        for( s=0; s<subscriptions.length; s++ )
        {
            session1Publish.Execute();
            AssertFalse( session1Publish.CurrentlyContainsData(), "Did not expect to receive a dataChange on the old Session." );
            AssertGreaterThan( 0, session1Publish.ReceivedStatusChanges.length, "Expected a statusChange in the OLD session to inform us that we no longer have the subscription." );
        }
        
        // now to verify the subscription is not affected by calling publish from the other session
        var session2Publish = new Publish( g_session[1] );
        for( p=0; p<subscriptions.length; p++ )
        {
            session2Publish.Execute();
            AssertTrue( session2Publish.CurrentlyContainsData(), "Expected a dataChange from our transferred subscriptions (" + (1+p) + " of " + subscriptions.length );
        }

        // Modify the publish mode for the subscription as was attached to the first session 
        var setPublishingModeRequest = new UaSetPublishingModeRequest();
        var setPublishingModeResponse = new UaSetPublishingModeResponse();
        g_session[0].buildRequestHeader( setPublishingModeRequest.RequestHeader );

        setPublishingModeRequest.PublishingEnabled = false;
        for( s=0; s<subscriptions.length; s++ )
        {
            setPublishingModeRequest.SubscriptionIds[s] = subscriptions[s].SubscriptionId;
        }

        var uaStatus = g_session[0].setPublishingMode( setPublishingModeRequest, setPublishingModeResponse );
        if(uaStatus.isGood())
        {
            var ExpectedOperationResultsArray = [];
            for( s=0; s<subscriptions.length; s++ )
            {
                ExpectedOperationResultsArray[s] = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
            }
            checkSetPublishingModeError( setPublishingModeRequest, setPublishingModeResponse, ExpectedOperationResultsArray );
            // clean-up
            ExpectedOperationResultsArray = null;
        }
        else
        {
            addError( "SetPublishingMode() status " + uaStatus, uaStatus );        
        }

        for( p=0; p<subscriptions.length; p++ )
        {
            session2Publish.Execute();
            AssertTrue( session2Publish.CurrentlyContainsData(), "Expected a dataChange from our transferred subscriptions." );
        }

        // clean-up
        for( s=0; s<subscriptions.length; s++ )
        {
            for( i = 0; i < allItems.length; i++ )
            {
                if( allItems[i].ClientHandle === subscriptions[s].SubscriptionId )
                {
                    deleteMonitoredItems( allItems[i], subscriptions[s], g_session[1] );
                }
            }
            deleteSubscription( subscriptions[s], g_session[1] );
        }
        // clear the publish object's properties...
        uaStatus = null;
        setPublishingModeResponse = null;
        setPublishingModeRequest = null;
        session2Publish = null;
    }
    else
    {
        // delete the original subscription added above
        for( s=0; s<subscriptions.length; s++ )
        {
            deleteSubscription( subscriptions[s], g_session[0] );
        }
    }
    // clean-up
    tsHelper = null;
    session1Publish = null;
    allItems = null;
    subscriptions = null;
    nodeSetting = null;
}

safelyInvoke( transferSubscription5103011 );