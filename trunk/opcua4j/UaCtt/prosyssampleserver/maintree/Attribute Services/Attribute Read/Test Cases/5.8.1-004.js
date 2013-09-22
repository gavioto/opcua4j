/*  Test 5.8.1 Test 4; prepared by Mark Rice: mrice@canarylabs.com

    Description:
        Read multiple attributes from a valid node with maxAge = 0.

    Revision History
        09-Sep-2009 MR: Initial version
        06-Nov-2009 NP: REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581004()
{
    var accesses = [ Attribute.AccessLevel, Attribute.BrowseName, Attribute.DataType,
                     Attribute.DisplayName, Attribute.Historizing, Attribute.NodeClass, 
                     Attribute.NodeId, Attribute.UserAccessLevel, Attribute.Value,
                     Attribute.ValueRank ];

    var coreItem = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() )[0];
    if( coreItem === null )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    var items = [];
    for( var i=0; i<accesses.length; i++ )
    {
        items[i] = MonitoredItem.Clone( coreItem );
        items[i].Attribute = accesses[i];
    }

    ReadHelper.Execute( items, TimestampsToReturn.Both, 0 );
}

safelyInvoke( read581004 );