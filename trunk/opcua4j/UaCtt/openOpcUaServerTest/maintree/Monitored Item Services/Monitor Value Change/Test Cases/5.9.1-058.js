/*  Test 5.9.1 Test 58 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script creates a MonitoredItem of type ByteStringArray with IndexRange of “1,2”.

    Revision History
        13-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED/INCONCLUSIVE. IndexRange not implemented in Server.
        14-Apr-2010 NP: Revised ByteString construction to use new method.
*/

function createMonitoredItems591058()
{
    var nodeSetting = "/Server Test/NodeIds/Static/All Profiles/Arrays/ByteString";

    // validate nodeSetting is a NodeId
    var nodeId = getNodeIdFromOptionalSetting( nodeSetting );
    if( nodeId === null )
    {
        addSkipped( "Arrays" );
        return;
    }

    // init the value by writing a ByteString that has a char at the test index
    writeByteStringArrayToValue( g_session, nodeId, [ 
        UaByteString.fromStringData( "hello" ), 
        UaByteString.fromStringData( "super" ), 
        UaByteString.fromStringData( "duper" ), 
        UaByteString.fromStringData( "world" ) ] );
    readIndexRangeArrayValues( MonitorBasicSubscription, nodeSetting, BuiltInType.ByteString, -1, 1, -1, 2, 0);
    revertOriginalValuesScalarStatic();
}

safelyInvoke( createMonitoredItems591058 );