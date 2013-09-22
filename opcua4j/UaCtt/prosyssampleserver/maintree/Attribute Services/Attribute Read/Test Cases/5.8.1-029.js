/*  Test 5.8.1 Test 129 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read the EventNotifier attribute from a valid node.

    Revision History
        28-Jun-2011 NP: Initial version
        14-Jul-2011 NP: Revised to read Value, NodeClass and EventNotifier and then 
                        determine if EventNotifier should succeed or not based on 
                        the NodeClass.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581001()
{
    var vItem = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, 0, TimestampsToReturn.Both, true )[0];
    if( vItem == null )
    {
        addSkipped( "Static Scalar" );
        return;
    }
    // now clone the items to get the NodeClass 
    var ncItem = MonitoredItem.Clone( vItem );
    ncItem.AttributeId = Attribute.NodeClass;
    // now clone the items to get the EventNotifier
    var enItem = MonitoredItem.Clone( vItem );
    enItem.AttributeId = Attribute.EventNotifier;

    var items = [ vItem, ncItem, enItem ];

    // for the sake of the read we will allow the call to succeed or fail until we 
    // do some post-processing.
    var expectations = [];
    for( var i=0; i<items.length; i++ )
    {
        expectations[i] = new ExpectedAndAcceptedResults( StatusCode.Good );
        expectations[i].addExpectedResult( StatusCode.BadAttributeIdInvalid );
    }
    ReadHelper.Execute( items, undefined, undefined, expectations, true );

    // post-processing
    var receivedNodeClass = ReadHelper.readResponse.Results[1].Value.toInt32();
    print( "** Received NodeClass: " + NodeClass.toString( receivedNodeClass ) );
    if( receivedNodeClass === NodeClass.Object || receivedNodeClass === NodeClass.View )
    {
        if( AssertTrue( ReadHelper.readResponse.Results[2].StatusCode.isGood(), "Expecting EventNotifier to work... received NodeClass: " + NodeClass.toString( receivedNodeClass ) ) )
        {
            addLog( "EventNotifier exists, as expected." );
        }
    }
    else
    {
        if( AssertFalse( ReadHelper.readResponse.Results[2].StatusCode.isGood(), "Expected reading the EventNotifier to fail... received NodeClass: " + NodeClass.toString( receivedNodeClass ) ) )
        {
            addLog( "EventNotifier does not exist, as expected." );
        }
    }

    // clean-up
    expectations = null;
    items = null;
    enItem = null;
    ncItem = null;
    vItem = null;
}

safelyInvoke( read581001 );