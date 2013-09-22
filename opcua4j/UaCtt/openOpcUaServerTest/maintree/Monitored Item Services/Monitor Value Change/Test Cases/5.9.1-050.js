/*  Test 5.9.1 Test 50 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script creates a MonitoredItem of type ByteString with IndexRange of “1”.

    Revision History
        13-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED/INCONCLUSIVE. IndexRange not supported in Server.
        21-Apr-2010 NP: Re-written to be easier to read/follow.
        15-Feb-2011 DP: Changed to use getNodeIdFromOptionalSetting().
*/

function createMonitoredItems591050()
{
    var nodeSetting = "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString";

    // validate nodeSetting is a NodeId
    var nodeId = getNodeIdFromOptionalSetting( nodeSetting );
    if( nodeId === null )
    {
        return;
    }

    var item = MonitoredItem.fromSetting( nodeSetting, 0 );
    if( item === null )
    {
        return;
    }
    
    
    // create the monitored item and call publish
    var originalString = "CTT 5.9.1-050";
    item.Value.Value.setByteString( UaByteString.fromStringData( originalString ) );
    if( WriteHelper.Execute( item ) )
    {
        item.IndexRange = "1";
        if( createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
        {
            print( "Value successfully written... waiting " + MonitorBasicSubscription.RevisedPublishingInterval + " before calling Publish." );
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            if( PublishHelper.Execute() )
            {
                if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive the initial value of the monitoredItems." ) )
                {
                    AssertEqual( 1, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive just one monitoredItem dataChange notification." );
                    var receivedByteStringValue = PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value.toByteString();
                    print( "\tReceived ByteString value of: " + receivedByteStringValue );
                    AssertEqual( 1, receivedByteStringValue.length, "Expected to receive just 1 length of the ByteString, based on the IndexRange specified." );
                    // now to convert the value received into a string, so we can compare it to 
                    // the character we expect in the original string
                    var receivedBsAsString = receivedByteStringValue.utf8ToString();
                    AssertEqual( originalString[1], receivedBsAsString, "Expected to receive the first character ONLY of the ByteString, but received something else." );
                    print( "<b>CHARACTER EXPECTED</b> '" + originalString[1] + "'; <b>ACTUALLY RECEIVED</b> '" + receivedBsAsString + "'" );
                }
            }
            // clean-up
            deleteMonitoredItems( item, MonitorBasicSubscription, g_session );
        }
    }
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems591050 );