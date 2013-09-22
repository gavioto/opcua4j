/*  Test 5.9.1 Error Test 28 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create a MonitoredItem using a ByteStringArray node and a StringArray node while 
        specifying invalid IndexRange as being outside of the bounds of the array.

        Expected Results:
            ServiceResult = Good.
            Operation level result = Bad_IndexRangeNoData

    Revision History
        03-Nov-2009 NP: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        25-Mar-2010 NP: Revised to meet new test-case requirements.
*/

function createMonitoredItems591Err028()
{
    // Nodes for all of the data types for this test
    var nodeNames = [
        "/Server Test/NodeIds/Static/All Profiles/Arrays/ByteString",
        "/Server Test/NodeIds/Static/All Profiles/Arrays/String"
    ];

    // validate nodeNames map to NodeIds
    for( var i = 0; i < nodeNames.length; i++ )
    {
        var nodeId = getNodeIdFromOptionalSetting( nodeNames[i] );
        if( nodeId === null )
        {
            addSkipped( "Arrays" );
            return;
        }
    }

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return;
    }

    //( settingNames, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn )
    var monitoredItems = MonitoredItem.fromSettings( nodeNames, 0, Attribute.Value, "99995:99999", MonitoringMode.Reporting, true, null, 1, 1000, TimestampsToReturn.Both );
    if( monitoredItems == undefined || monitoredItems.length != 2 )
    {
        addError( "Test aborted because the monitoredItems are not correctly configured, or are too few." );
        return;
    }

    // we expect the call to fail, Bad_IndexRangeInvalid
    var expectedResults = [
        new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeNoData ),
        new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeNoData ) ];
    // however, we acknowledge that the calls may succeed too:
    expectedResults[0].addExpectedResult( StatusCode.Good );
    expectedResults[1].addExpectedResult( StatusCode.Good );
    // go ahead and create the monitoredItems and then wait
    createMonitoredItems( monitoredItems, TimestampsToReturn.Both, MonitorBasicSubscription, g_session, expectedResults, true );
    wait( MonitorBasicSubscription.RevisedPublishingInterval );
    // call Publish if applicable... if GOOD then publish, otherwise skip publish
    if( createMonItemsResp.Results[0].StatusCode.isGood() )
    {
        if( publishService.Execute() )
        {
            if( AssertTrue( publishService.CurrentlyContainsData(), "Expected to receive a dataChange notification." ) )
            {
                var receivedCode = publishService.CurrentDataChanges[0].MonitoredItems[0].Value.StatusCode.StatusCode;
                if( receivedCode === StatusCode.Good || receivedCode === StatusCode.BadIndexRangeNoData )
                {
                    addLog( "Received expected StatusCode in PublishResponse dataChange notification message: " + receivedCode );
                }
                else
                {
                    addError( "Expected to receive StatusCode GOOD or BAD_INDEXRANGENODATA in PublishResponse, but received: " + receivedCode );
                }
            }
        }
        deleteMonitoredItems( monitoredItems, MonitorBasicSubscription, g_session );
    }
    else
    {
        addLog( "Skipping Publish call since Server did not create the monitored item." );
    }
    // clean-up
    publishService.Clear();
}

safelyInvoke( createMonitoredItems591Err028 );