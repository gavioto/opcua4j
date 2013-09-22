/*  Test 5.8.1 Test 1; prepared by Development; compliance@opcfoundation.org

    Description:
        Read a single attribute from a valid node.

    Revision History
        24-Aug-2009 Dev: Initial version
        06-Nov-2009 NP:  Verified.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581001()
{
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, 0, TimestampsToReturn.Both, true );
    if( monitoredItems == null || monitoredItems.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    if( ReadHelper.Execute( monitoredItems[0], TimestampsToReturn.Server ) )
    {
        addLog( "Read Results:\n\t" + ReadHelper.ValuesToString() );
    }
}

safelyInvoke( read581001 );