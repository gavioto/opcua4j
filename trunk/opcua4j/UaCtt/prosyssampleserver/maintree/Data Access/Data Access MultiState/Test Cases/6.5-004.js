/*  Test 6.5 Test 4; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Create a MonitoredItem where the node is of /derives from type
        MultiStateDiscrete (DA Profile).
        In a loop: write a value to the Node, call Publish() and compare the
        value received to the value written.

    Expectations:
        All service and operation level results are Good.
        The values received in Publish() match the values written, and the
        quality is Good with a valid timestamp.

    Revision History:
        18-Feb-2010 NP: Initial version.
        26-Aug-2010 NP: Permitting Bad_OutOfRange when ENUM write exceeds bounds of array.
        10-Jun-2011 NP: Added a missing WAIT before a Publish call.
                        Changed error Bad_OutOfBounds from warning to accepted. See Part 8 5.2.3.2 MultiStateDiscreteType para 1 (after table 5). [Credit: Thomas Merk]
        29-Jun-2011 Matthias Lechner: When writing a value fails due to Bad_OutOfBound, the test must not expect a data change.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function subscription65004()
{
    // get the enumStrings first
    var enumStrings = GetMultiStateDiscreteEnumStrings( multiStateItems[0].NodeSetting, g_session, ReadHelper );
    if( enumStrings === undefined || enumStrings === null || enumStrings.length === 0 )
    {
        addWarning( "Test aborted. MultiState item '" + multiStateItems[0].NodeSetting + "' does not have any EnumStrings defined." );
        return;
    }
    // now get the initial value of the enum so that we can revert it at the end
    ReadHelper.Execute( multiStateItems[0] );
    multiStateItems[0].InitialValue = multiStateItems[0].Value.Value.clone();

    var NUM_WRITES = ( enumStrings.length * 2 );
    // create the subscription
    var subscription = new Subscription();
    if( createSubscription( subscription, g_session ) )
    {
        //create the monitored item within the subscription
        if( createMonitoredItems( multiStateItems[0], TimestampsToReturn.Both, subscription, g_session ) )
        {
            // wait and get the initial publish out of the way...
            wait( subscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            // now to set the value to something different than what was just received
            var initialEnumValue = PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value.toUInt32();
            if( initialEnumValue === 0 )
            {
                initialEnumValue = 1;
            }
            multiStateItems[0].Value.Value.setUInt32( initialEnumValue );
            if( WriteHelper.Execute( multiStateItems[0] ) )
            {
                // we just RESET the enum to perform the following testing, but the write
                // has been queued for publish, so lets dequeue it now
                wait( subscription.RevisedPublishingInterval );
                PublishHelper.Execute();
                // here's the loop, write a value; wait; publish; compare
                for( var i=0; i<NUM_WRITES; i++ )
                {
                    // we expect the values to succeed while within the bounds of the enum
                    // but some servers may support writes that exceed the bounds!
                    var expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
                    if( i >= enumStrings.length )
                    {
                        expectedResults[0].addExpectedResult( StatusCode.BadOutOfRange );
                    }
                    // write
                    multiStateItems[0].Value.Value.setUInt32( i );
                    if( WriteHelper.Execute( multiStateItems[0], expectedResults, true ) )
                    {
                        // we only expect data changes if the written value is not out of range
                        if( WriteHelper.writeResponse.Results[0].StatusCode != StatusCode.BadOutOfRange )
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
                                // we expect the data-type to be a UInt32 (according to UA Spec part 8: Table 5
                                AssertEqual( BuiltInType.toString( BuiltInType.UInt32 ), BuiltInType.toString( PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value.DataType ), "Nodes of this type should be UInteger/UInt32 types!" );
                                // we expect to receive the same value we wrote
                                var writeVal = UaVariantToSimpleType ( multiStateItems[0].Value.Value );
                                var readVal = UaVariantToSimpleType ( PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value );
                                AssertEqual( writeVal, readVal, "Expected to receive the same value we previously wrote!" ); 
                            }// publish
                        }
                        else
                        {
                            addLog( "Could not write value " + multiStateItems[0].Value.Value + " to item " + multiStateItems[0].NodeSetting + " (BadOutOfRange)" );
                        }
                    }// write
                    else
                    {
                        addError( "Aborting test. Write failed!" );
                        break;
                    }
                }// for i...
                // now revert to the original value
                multiStateItems[0].Value.Value = multiStateItems[0].InitialValue.clone();
                expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
                WriteHelper.Execute( multiStateItems[0], expectedResults, true );
            }//write
        }// createmonitoreditems
    }// createsubscription
    // clean-up
    deleteMonitoredItems( multiStateItems[0], subscription, g_session );
    deleteSubscription( subscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( subscription65004 );