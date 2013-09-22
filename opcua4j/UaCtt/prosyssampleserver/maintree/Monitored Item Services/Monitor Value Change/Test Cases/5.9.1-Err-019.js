/*  Test 5.9.1 Error Test 19 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Script specifies an invalid IndexRange of “2:3,1:2” which is specified for a 2-dimensional
        array, but the node being tested is a single dimension array.
        The ValueRank and ArrayDimensions attributes are checked beforehand.
        IF THE SERVER RETURNS GOOD, then a Publish must be called and the initial status code must
        be Bad_IndexRangeNoData.

    Revision History
        16-Dec-2009 NP: Initial Version.
        09-Jun-2010 NP: Revised validation of createMonitoredItems to call deleteMonitoredItems when applicable.
*/

function createMonitoredItems591Err019()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Test aborted. Subscription for 'Monitor Value Change' was not created." );
        return;
    }
    var nodeId = NodeIdSettings.GetArrayStaticNodeIds()[0];
    if( nodeId === null || nodeId === undefined )
    {
        addSkipped( "Arrays" );
        return;
    }

    const ISARRAY = 1;
    const INVALIDINDEXRANGE = "2:3,1:2";

    // create 2 nodes, one to read each attribute of interest
    var valueRankNode = MonitoredItem.fromNodeIds( [nodeId], Attribute.ValueRank )[0];
    if( ReadHelper.Execute( [valueRankNode] ) )
    {
        // we desire "1" (meaning the dimensions are 1 dimensional) but we will accept
        // "0" because that means the server doesn't know itself and therefore may be a valid node to test with.
        if( !( 0 == valueRankNode.Value.Value || 1 == valueRankNode.Value.Value ) )
        {
            addSkipped( "valueRank doesn't match the single-dimension array criteria. This test requires a valueRank of " + ISARRAY + ", but received " + valueRankNode.Value.Value.toString() );
            return;
        }
    }// readSetting

    // now to specify the indexRange and to call createMonitoredItems
    valueRankNode.AttributeId = Attribute.Value;
    valueRankNode.IndexRange  = INVALIDINDEXRANGE;
    
    var expectedError = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
    expectedError[0].addExpectedResult( StatusCode.BadIndexRangeNoData );
    createMonitoredItems( valueRankNode, TimestampsToReturn.Both, MonitorBasicSubscription, g_session, expectedError, true );
    if( createMonItemsResp.Results[0].StatusCode.isGood() )
    {
        // it was good, so lets wait and call Publish and then check the status in the response 
        wait( MonitorBasicSubscription.RevisedPublishingInterval );
        PublishHelper.Execute();
        if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive an initial dataChange notification, even though we do not expect to receive any valid data." ) )
        {
            if( AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected 1 monitored Item in the Publish response." ) )
            {
                AssertStatusCodeIs( StatusCode.BadIndexRangeNoData, PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.StatusCode, "Initial status code is different." );
            }
            else
            {
                addError( "Subscription callback received: " + PublishHelper.PrintDataChanges() );
            }
        }
        deleteMonitoredItems( valueRankNode, MonitorBasicSubscription, g_session );
    }
    else
    {
        addLog( "Skipping DeleteMonitoredItems call because CreateMonitoredItems failed (as expected)." );
    }
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems591Err019 );