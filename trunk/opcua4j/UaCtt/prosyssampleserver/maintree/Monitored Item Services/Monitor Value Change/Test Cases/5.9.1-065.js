/*  Test 5.9.1 Test 65 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create a monitored item of an array with an IndexRange of “2:4” (the array must currently have at least five elements).
        Call Publish. Write to the array such that the size changes to two elements (0:1). Call Publish.
    ExpectedResults:
        All service and operation level results are Good. Second Publish response contains a DataChangeNotification
        with a value.statusCode of Bad_IndexRangeNoData.

    Revision History:
        11-Dec-2009 NP: Initial Version.
        30-Sep-2010 KH: Fixed bug where the MonitoredItem AttributeId wasn't set back to Value after determining
                        if the ValueRank allowed the array size to change.
                        Changed StatusCode comparison to use AssertStatusCodeIs instead of AssertEquals.
*/

function createMonitoredItems591065()
{
    // get the Nodes to test with.. each node is of Type Array (defined in the Settings )
    var item = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 1, Attribute.ValueRank, "", MonitoringMode.Reporting, true, null, 10, 1000, TimestampsToReturn.Both )[0];
    if( item == null )
    {
        addSkipped( "Arrays" );
        return;
    }

    // read the item to determine if its array can change
    if( ReadHelper.Execute( item ) )
    {
        if( item.Value.Value > -2 ) // -2=can be scalar and/or array, -3=scalar or 1d array
        {
            addSkipped( "Array specified for test indicates that its dimensions cannot be changed." );
            return;
        }
    }
           
    writeValueToValue( g_session, item.NodeId, generateArrayWriteValue( 0, 4, NodeIdSettings.guessType( item.NodeSetting ) ) );

    // Set the Attribute we're interested in back to Value
    item.AttributeId = Attribute.Value;
    item.IndexRange = "2:4";

    // create the monitored items
    if( createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        // wait 1 publish cycle before calling publish()
        wait( MonitorBasicSubscription.RevisedPublishingInterval );
        // Call Publish #1, and make sure we receive data for all MonitoredItems, and that each 
        // dataset received is of type array.
        if( PublishHelper.Execute() )
        {
            // is dataChange value received of type array?
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange." ) )
            {
                // now to re-write the array and cause its size to change like "[0,1]".
                item.IndexRange="";
                item.Value.Value = generateArrayWriteValue( 0, 1, NodeIdSettings.guessType( item.NodeSetting ) );
                if( WriteHelper.Execute( item ) )
                {
                    // wait 1 publish cycle before calling publish()
                    wait( MonitorBasicSubscription.RevisedPublishingInterval );
                    // now to see if the publish #2 confirms the array change
                    if( PublishHelper.Execute() &&
                        AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected a dataChange because we've re-written the array and changed its size!" ) )
                    {
                        AssertStatusCodeIs( StatusCode.BadIndexRangeNoData, PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.StatusCode, "StatusCode mismatch." );
                    }// publish and contains data?
                }// write
            }// currentlyContainsData?
        }// publish?
    }
    // clean-up
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
    PublishHelper.Clear();
    revertOriginalValuesScalarStatic();
}

safelyInvoke( createMonitoredItems591065 );