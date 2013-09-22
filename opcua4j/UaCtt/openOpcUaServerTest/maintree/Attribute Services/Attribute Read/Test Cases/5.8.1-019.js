/*  Test 5.8.1 Test 19; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read a single attribute from a valid node, looping through the following
        attributes:

        AccessLevel, BrowseName, DataType, DisplayName, Historizing, 
        NodeClass, NodeId, UserAccessLevel, ValueRank

        NOTE: Each read is to be conducted individually.

    Revision History
        23-Sep-2009 NP: Initial version.
        10-Nov-2009 NP: Revised to use new script library objects.
        10-Nov-2009 NP: Reviewed.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581019()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    // here are the Node attributes we will read INDIVIDUALLY!
    var attributesToTest = [
        Attribute.AccessLevel,
        Attribute.BrowseName,
        Attribute.DataType,
        Attribute.DisplayName,
        Attribute.Historizing,
        Attribute.NodeClass,
        Attribute.NodeId,
        Attribute.UserAccessLevel,
        Attribute.ValueRank
        ];

    // go into a loop so we can do one read per attribute
    for( var i=0; i<attributesToTest.length; i++ )
    {
        items[0].AttributeId = attributesToTest[i];

        ReadHelper.Execute( items[0], TimestampsToReturn.Source );
        AssertNull( ReadHelper.readResponse.Results[0].Value.SourceTimestamp, "Source timestamp expected to be empty/null since we are reading non-Value attributes!" );
    }// for i...
}

safelyInvoke( read581019 );