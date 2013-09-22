/*  Test 5.9.1 Test 56 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script creates a MonitoredItem of type ByteStringArray with IndexRange of “1:2,2:3”.

    Revision History
        13-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED/INCONCLUSIVE. IndexRange not implemented in Server.
        14-Apr-2010 NP: Revised ByteString construction to use new method.
        28-Aug-2010 NP: Completely re-write to test behavior differently and more accurately.
        14-Feb-2011 DP: Changed to use getNodeIdFromOptionalSetting().

    Explanation:
        Assume the following strings in an array:
            "hello"
            "world"
            "goodbye"
        IndexRange "1:2,2:3" would yield these values:
            "rl"
            "od"
*/

function createMonitoredItems591056()
{
    var nodeSetting = "/Server Test/NodeIds/Static/All Profiles/Arrays/ByteString";
    var i;

    // validate nodeSetting is a NodeId
    var nodeId = getNodeIdFromOptionalSetting( nodeSetting );
    if( nodeId === null )
    {
        addSkipped( "ByteString array not configured in setting: " + nodeSetting );
        return;
    }

    var item = MonitoredItem.fromSetting( nodeSetting );
    if( item === null )
    {
        return;
    }
    
    // first: read the raw array value for the item 
    ReadHelper.Execute( item );
    print( item.Value.toString() );
    // store the initial value 
    item.InitialValue = item.Value.Value.clone();
    // second: check quality is good - otherwise exit
    if( AssertTrue( item.Value.StatusCode.isGood(), "Cannot use node for testing because the quality is Bad." ) )
    {
        // check the value contains the size of data we need
        if( item.Value.Value.ArrayType !== 1 )
        {
            addWarning( "Node '" + item.NodeSetting + "' is not an array. Aborting test." );
            return;
        }
        var bs = item.Value.Value.toByteStringArray();
        var doInitialize = false;
        if( bs === null )
        {
            doInitialize = true;
        }
        else
        {
            for( i=0; i<bs.length; i++ )
            {
                if( bs[i].length < 5 )
                {
                    doInitialize = true;
                    break;
                }
            }
        }

        if( doInitialize )
        {
            print( "\n\n\n---< Setting the array values to something of use >---\n\n" );
            var initValue = new UaByteStrings();
            for( i=0; i<bs.length; i++ )
            {
                initValue[i] = UaByteString.fromStringData( "HelloWorld#" + i );
            }
            item.Value.Value.setByteStringArray( initValue );
            if( !WriteHelper.Execute( item ) )
            {
                addError( "Unable to setup the array type for the test. Aborting test." );
                return;
            }
            ReadHelper.Execute( item );
            print( item.Value.toString() );
            print( "\n\n\n---< Test will now resume >---\n\n" );
        }


        // set the indexRange “1:2,2:3”
        item.IndexRange = "1:2,2:3";

        var expectedValues = GetByteStringsAtIndexRange( item.Value.Value.toByteStringArray(), item.IndexRange );
        if( createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
        {
            // wait and then call Publish 
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();
            if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive the initial values." ) )
            {
                // now to compare the value in the Publish response to the value read,
                // we are expecting a subset of the array data
                var publishedValues = PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value.toByteStringArray();
                addLog( "\n\nRead value RAW: " + item.InitialValue );
                addLog( "Publish received value: " + publishedValues );
                addLog( "Expected values: " + expectedValues );
                // now to make sure we received ONLY the values expected 
                print( "**** Comparing Publish results to our expectations ****" );
                AssertEqual( expectedValues.length, publishedValues.length, "Publish did not yield the same information as expected." );
                for( i=0; i<expectedValues.length; i++ )
                {
                    print( "\t" + (1+i) + ".) Expecting: '" + expectedValues[i] + "'; Received: '" + publishedValues[i] + "'." );
                    AssertEqual( expectedValues[i], publishedValues[i], "Publish yielded a different value at position " + i + " than expected." );
                }
            }
        }
        // clean-up
        deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
        // revert the previous value 
        if( doInitialize )
        {
            print( "\n\nReverting to original value." );
            item.IndexRange = "";
            item.Value.Value = item.InitialValue.clone();
            WriteHelper.Execute( item );
        }
        revertOriginalValuesScalarStatic();
    }
}

safelyInvoke( createMonitoredItems591056 );