/*  Test 5.9.1 Test 52 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script creates a MonitoredItem of type ByteString with IndexRange of “2:3”.

    Revision History
        13-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server support for IndexRange cannot be trusted.
        14-Apr-2010 NP: Revised ByteString construction to use new method.
        26-Apr-2010 NP: Bugfix: Data verification.
*/

function createMonitoredItems591052()
{
    var nodeSetting = "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString";

    // validate nodeSetting is a NodeId
    var nodeId = getNodeIdFromOptionalSetting( nodeSetting );
    if( nodeId === null )
    {
        return;
    }

    var item = MonitoredItem.fromSetting( nodeSetting, 0 );
    if( item == null )
    {
        return;
    }

    // init the value by writing a String that has a char at the test index
    var initialValue = UaByteString.fromStringData( "CTT 5.9.1-052" );
    item.Value.Value.setByteString( initialValue );
    if( !WriteHelper.Execute( item ) )
    {
        addError( "Exiting test. Unable to set the initial value of the ByteString to: " + item.Value.Value );
        return;
    }

    // now add the item to a subscription and call publish, the subscription ONLY CARES ABOUT
    // IndexRange "1".
    item.IndexRange = "2:3";
    if( !createMonitoredItems( item, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        addError( "Exiting test. Couldn't add the monitoredItem to the subscription." );
        return;
    }

    // wait one publishing cycle before calling publish
    wait( MonitorBasicSubscription.RevisedPublishingInterval );

    if( PublishHelper.Execute() )
    {
        PublishHelper.SetItemValuesFromDataChange( [item] );
        // check to see the value received was the 2nd character of the value we initial wrote
        var initialValue2ndCharacter = initialValue.getRange( 2, 3 ); //2nd chr$
        AssertCoercedEqual( initialValue2ndCharacter.toString(), item.Value.Value.toString(), "Expected the Publish to yield ONLY the values within the specified IndexRange position." );
    }

    // clean-up
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session  );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems591052 );