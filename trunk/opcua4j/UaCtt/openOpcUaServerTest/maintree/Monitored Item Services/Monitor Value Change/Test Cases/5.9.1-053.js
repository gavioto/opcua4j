/*  Test 5.9.1 Test 53 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script creates a MonitoredItem of type String with IndexRange of “2:3”.

    Revision History
        13-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server support for IndexRange cannot be trusted.
        26-Apr-2010 NP: Bugfix: Data validation.
*/

function createMonitoredItems591053()
{
    var nodeSetting = "/Server Test/NodeIds/Static/All Profiles/Scalar/String";

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

    // init the value by writing a String that has a char at the test index
    var initialValue = "Hello World from the OPC Unified Architecture Compliance Test Tool (OPC UA CTT)";
    item.Value.Value.setString( initialValue );
    if( !WriteHelper.Execute( item, undefined, undefined, undefined, true ) )
    {
        addError( "Exiting test. Unable to set the initial value of the String to: " + item.Value.Value );
        return;
    }

    // now add the item to a subscription and call publish, the subscription ONLY CARES ABOUT
    // IndexRange "2:3".
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
        var initialValue2ndCharacter = initialValue.substring( 2, 4 ); //3rd and 4th chr$
        AssertCoercedEqual( initialValue2ndCharacter, item.Value.Value, "Expected the Publish to yield ONLY the values within the specified IndexRange position." );
    }

    // clean-up
    deleteMonitoredItems( item, MonitorBasicSubscription, g_session  );
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems591053 );