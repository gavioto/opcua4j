/*  Test 6.5 Test 5; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Create multiple MonitoredItems where each node is of /derives from type
        MultiStateDiscrete (DA Profile).
        In a loop: write a value to each Node, call Publish() and compare the
        value received to the value written.

    Expectations:
        All service and operation level results are Good.
        The values received in Publish() match the values written, and the
        quality is Good with a valid timestamp.

    Revision History:
        18-Feb-2010 NP: Initial version.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function subscription65005()
{
    // create the subscription
    var subscription = new Subscription();
    if( createSubscription( subscription, g_session ) )
    {
        //create the monitored item within the subscription
        if( createMonitoredItems( multiStateItems, TimestampsToReturn.Both, subscription, g_session ) )
        {
            // wait and get the initial publish out of the way...
            wait( subscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive the initial values for all monitored items." ) )
            {
                // set the new values
                for( var m=0; m<PublishHelper.CurrentDataChanges[0].MonitoredItems.length; m++ )
                {
                    var initialValue = PublishHelper.CurrentDataChanges[0].MonitoredItems[m].Value.Value.toUInt32();
                    var newValue = initialValue === 0? 1: 0;
                    addLog( "Setting initial value for Node '" + multiStateItems[m].NodeSetting +
                        "' to value: '" + newValue + "'; the initial reading was: '" + initialValue + "'" );
                    multiStateItems[m].Value.Value.setUInt32( newValue );
                    multiStateItems[m].InitialState = initialValue;
                }

                if( WriteHelper.Execute( multiStateItems ) )
                {
                    // wait
                    wait( subscription.RevisedPublishingInterval );
                    // publish
                    if( PublishHelper.Execute() )
                    {
                        if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive DataChange notifications. Since we changed the state of the MultiStateDiscrete type items." ) )
                        {
                            // we expect to receive the same value we wrote
                            for( var r=0; r<PublishHelper.CurrentDataChanges[0].MonitoredItems.length; r++ )
                            {
                                // we expect a data change
                                AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected a DataChange!" );
                                // we expect the data-type to be a UInt32 (according to UA Spec part 8: Table 5
                                AssertEqual( BuiltInType.toString( BuiltInType.UInt32 ), BuiltInType.toString( PublishHelper.CurrentDataChanges[0].MonitoredItems[r].Value.Value.DataType ), "Nodes of this type should be UInt32 types!" );
                                // we expect to receive the same value we wrote
                                //AssertCoercedEqual( 0, PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value.toUInt32(), "Expected to receive the same value we previously wrote!" );
                                var writeVal =  multiStateItems[r].Value.Value.toUInt32();
                                var readVal = PublishHelper.CurrentDataChanges[0].MonitoredItems[r].Value.Value.toUInt32();
                                AssertEqual( writeVal, readVal, "Expected to receive the same value we previously wrote!" ); 
                            }// for r...
                        }// currently contains data
                    }// publish
                    
                    // put the enum values back to their original state
                    addLog( "Putting EnumValues back to their original states..." );
                    for( var i=0; i<multiStateItems.length; i++ )
                    {
                        multiStateItems[i].Value.Value.setUInt32( multiStateItems[i].InitialState );
                    }
                    WriteHelper.Execute( multiStateItems );
                }// write
            }//initial value received
        }// createmonitoreditems
    }// createsubscription
    // clean-up
    deleteMonitoredItems( multiStateItems, subscription, g_session );
    deleteSubscription( subscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( subscription65005 );