/*  Test 5.9.1 Error Test 29 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create MonitoredItems of the following types:
            String, Boolean, ByteString, DateTime.
            For each, specify a DeadbandAbsolute of 10
 
        Expected Results:
            ServiceResult = Good.
            Operation level result = Bad_FilterNotAllowed

    Revision History
        04-Dec-2009 NP: Initial Version.
        10-Dec-2010 NP: Added Bad_MonitoredItemFilterUnsupported.
        20-Dec-2010 NP: Streamlined code to CreateMonitoredItems once (instead of loop).
*/

function createMonitoredItems591Err029()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
        return;
    }

    var settings = [
        "/Server Test/NodeIds/Static/All Profiles/Scalar/String",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime"
        ];

    // define the items and expected results variables
    var items = [];
    var expectedResults = [];
    // populat the above variables with contents..
    for( var i=0; i<settings.length; i++ )
    {
        var nodeId = getNodeIdFromOptionalSetting( settings[i] );
        if( nodeId === null ) { continue; }
        var item = MonitoredItem.fromNodeIds( [ nodeId ] )[0];
        if( item !== null )
        {
            item.Filter = Event.GetDataChangeFilter( DeadbandType.Absolute, 10, DataChangeTrigger.StatusValue );
            var expectedResult = new ExpectedAndAcceptedResults( StatusCode.BadFilterNotAllowed );
            expectedResult.addExpectedResult( StatusCode.BadMonitoredItemFilterUnsupported );
            expectedResults.push( expectedResult );
        }// item!=null
        items.push( item );
    }//for i...
    // we've defined our items, now add them!
    if( createMonitoredItems( items, TimestampsToReturn.Both, MonitorBasicSubscription, g_session, expectedResults, true ) )
    {
        if( createMonItemsResp.Results[0].StatusCode.StatusCode === StatusCode.BadMonitoredItemFilterUnsupported )
        {
            addNotSupported( "DeadbandAbsolute" );
        }
        // clean-up
        // no items should exist, so the call should fail.
        expectedResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        deleteMonitoredItems( items, MonitorBasicSubscription, g_session, expectedResult, false );
    }
}

safelyInvoke( createMonitoredItems591Err029 );