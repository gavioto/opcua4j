/*  Test 6.6 Test 5; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

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

function subscription66005()
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
        //create the monitored item within the subscription
        if( createMonitoredItems( twoStateItems[0], TimestampsToReturn.Both, subscription, g_session ) )
        {
            // get the initial values first, before testing...
            wait( subscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            // here's the loop, write a value; wait; publish; compare
            for( var i=0; i<NUM_WRITES; i++ )
            {
                // write
                twoStateItems[0].Value.Value.setBoolean( !twoStateItems[0].Value.Value.toBoolean() );
                if( WriteHelper.Execute( twoStateItems[0] ) )
                {
                    // wait
                    wait( subscription.RevisedPublishingInterval );
                    // publish
                    if( PublishHelper.Execute() )
                    {
                        // we expect a data change
                        AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected a DataChange!" );
                        // we expect 1 notification
                        AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected only 1 notification!" );
                        // we expect to receive the same value we wrote
                        AssertEqual( twoStateItems[0].Value.Value.toBoolean(), PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value.toBoolean(), "Expected to receive the same value we previously wrote!" );
                    }// publish
                }// write
                else
                {
                    addError( "Aborting test. Write failed!" );
                    break;
                }
            }// for i...
        }// createmonitoreditems
    }// createsubscription
    // clean-up
    deleteMonitoredItems( twoStateItems[0], subscription, g_session );
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

safelyInvoke( subscription66005 );