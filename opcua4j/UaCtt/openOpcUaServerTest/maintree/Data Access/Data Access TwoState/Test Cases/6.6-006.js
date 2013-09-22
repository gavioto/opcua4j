/*  Test 6.6 Test 6; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Create a MonitoredItem where the node is of /derives from type TwoStateDiscrete
        (DA Profile).
        In a loop: write a value to the Node, call Publish() and compare the value
        received to the value wrote.
    Expectations:
        All service and operation level results are Good.
        The values received in Publish() match the values written, and the quality isGood
        with a valid timestamp.

    Revision History:
        17-Feb-2010 NP: Initial version.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function subscription66006()
{
    const NUM_WRITES = 10;
    if( twoStateItems == null || twoStateItems.length == 0 )
    {
        addSkipped( TSDT );
        return;
    }

    // read the nodes first, because we'll toggle the values
    if (!ReadHelper.Execute( twoStateItems ) )
    {
        return;
    }
    // store the initial values
    for( var i=0; i<twoStateItems.length; i++ )
    {
        twoStateItems[i].InitialValue = twoStateItems[i].Value.Value.clone();
    }

    // create the subscription
    var subscription = new Subscription();
    if( createSubscription( subscription, g_session ) )
    {
        //create the monitored items within the subscription
        if( createMonitoredItems( twoStateItems, TimestampsToReturn.Both, subscription, g_session ) )
        {
            // get the initial values first, before testing...
            wait( subscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            // here's the loop, write a value; wait; publish; compare
            for( var i=0; i<NUM_WRITES; i++ )
            {
                // set the new values
                for( var m=0; m<twoStateItems.length; m++ )
                {
                    var newBitVal = !twoStateItems[m].Value.Value.toBoolean();
                    twoStateItems[m].Value.Value.setBoolean( newBitVal );
                    twoStateItems[m].WrittenValue = twoStateItems[m].Value.Value.clone();
                }
                // write
                if( WriteHelper.Execute( twoStateItems ) )
                {
                    // wait
                    wait( subscription.RevisedPublishingInterval );
                    // publish
                    if( PublishHelper.Execute() )
                    {
                        // we expect a data change
                        if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected a DataChange!" ) )
                        {
                            PublishHelper.SetItemValuesFromDataChange( twoStateItems, "v" );
                            // we expect multiple notifications
                            AssertEqual( twoStateItems.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, ("Expected " + twoStateItems.length + " notifications!") );
                            // we expect to receive the same value we wrote
                            for( var r=0; r<twoStateItems.length; r++ )
                            {
                                AssertEqual( twoStateItems[r].Value.Value.toBoolean(), twoStateItems[r].WrittenValue.toBoolean(), "Expected to receive the same value as previously written on Node '" + twoStateItems[r].NodeSetting + "'" );
                            }
                        }
                    }// publish
                }// write
                else
                {
                    break;
                }
            }// for i...
        }// createmonitoreditems
    }// createsubscription
    // clean-up
    deleteMonitoredItems( twoStateItems, subscription, g_session );
    deleteSubscription( subscription, g_session );
    PublishHelper.Clear();
    // revert the nodes back to their original values
    print( "\n\n\nReverting to original values." );
    for( var i=0; i<twoStateItems.length; i++ )
    {
        twoStateItems[i].Value.Value = twoStateItems[i].InitialValue.clone();
    }
    WriteHelper.Execute( twoStateItems );
}

safelyInvoke( subscription66006 );