/*  Test 5.9.1 Test 59 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script creates a MonitoredItem of type StringArray with IndexRange of “1,2”.

    Revision History
        13-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED/INCONCLUSIVE. IndexRange not implemented in Server.
        13-Dec-2010 NP: Rewritten to be easier to follow. Existing code too complex.
                        Does not write to IndexRange now.
*/

function createMonitoredItems591059()
{
    const INDEXRANGE = "1:2";
    var nodeSetting = "/Server Test/NodeIds/Static/All Profiles/Arrays/String";

    // validate nodeSetting is a NodeId
    var nodeId = getNodeIdFromOptionalSetting( nodeSetting );
    if( nodeId === null )
    {
        addSkipped( "Arrays" );
        return;
    }

    var item = MonitoredItem.fromSetting( nodeSetting, 0 );
    if( item == null )
    {
        return;
    }

    // obtain the original value, allowing for "Bad_
    var initialValue;
    item.MonitoringMode = MonitoringMode.Reporting;
    if( ReadHelper.Execute( item ) )
    {
        // validate the item
        initialValue = item.Value.Value.toStringArray();
        if( initialValue === null )
        {
            addError( "Unable to read the value of node '" + nodeSetting + "'." );
            return;
        }
        else
        {
            AssertGreaterThan( 2, initialValue.length, "Expected an array greater than 2." );
        }
    }

    item.IndexRange = INDEXRANGE;
    if( !createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        addError( "Exiting test. Couldn't add the monitoredItem to the subscription." );
        return;
    }

    // wait one publishing cycle before calling publish
    wait( MonitorBasicSubscription.RevisedPublishingInterval );

    if( PublishHelper.Execute() )
    {
        if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive the initial dataChange value." ) )
        {
            // we read the whole array value earlier, now we're interested in 2 specific elements
            var expectedValues = [ initialValue[1], initialValue[2] ];
            // now to get the values read from the publish so we can compare them
            PublishHelper.SetItemValuesFromDataChange( [item] );
            var receivedValueNative = item.Value.Value.toStringArray();
            var receivedValues = [ receivedValueNative[0], receivedValueNative[1] ];
            if( AssertEqual( 2, receivedValues.length, "Expected to receive 2 values only." ) )
            {
                print( "\n\n\n\t*** Truth time: checking the value received in Publish vs. value in Read. ***" );
                print( "\t*** Original Read value: " + initialValue );
                print( "\t*** Expecting value(s): " + expectedValues );
                print( "\t*** Publish value: " + item.Value.Value + "\n\n\n" );
                for( var i=0; i<receivedValues.length; i++ )
                {
                    AssertEqual( expectedValues[i], receivedValues[i] );
                }//for
            }
        }
    }

    // clean-up
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session  );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems591059 );