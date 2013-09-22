/*  Test 5.8.1 Test 2; prepared by Development; compliance@opcfoundation.org

    Description:
        Read multiple attributes from a valid node.

    Revision History
        24-Aug-2009 Dev: Initial version
        06-Nov-2009 NP:  Verified.
        13-May-2010 DP: Get any scalar static NodeId settings instead of just the one-of-every-datatype NodeIds.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581002()
{
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.ScalarStaticAll(), 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, 0, TimestampsToReturn.Both, true );
    if( monitoredItems == null || monitoredItems.length < 4 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    // specify the attributes
    monitoredItems[0].AttributeId = Attribute.BrowseName;
    monitoredItems[1].AttributeId = Attribute.DisplayName;
    monitoredItems[2].AttributeId = Attribute.NodeClass;
    monitoredItems[3].AttributeId = Attribute.NodeId;

    if( ReadHelper.Execute( [ monitoredItems[0], monitoredItems[1], monitoredItems[2], monitoredItems[3] ] ) )
    {
        addLog( "Read Results:\n\t" + ReadHelper.ValuesToString() );
    }
}

safelyInvoke( read581002 );