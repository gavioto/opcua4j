/*  Test 5.8.1 Error Test 22; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read: Specify an invalid TimestampsToRead value.
        Expects Bad_TimestampsToReturnInvalid.

    Revision History
        20-Oct-2009 NP: Initial version.
        11-Nov-2009 NP: REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581Err022()
{
    const INVALID_TIMESTAMPTORETURN = 0x12345;

    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, Attribute.Value, "", MonitoringMode.Reporting, true, null, 1, 0, TimestampsToReturn.Both, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    // we do expect this to fail:
    var expectedFail = new ExpectedAndAcceptedResults( StatusCode.BadTimestampsToReturnInvalid );

    // commit the read
    if( ReadHelper.Execute( items[0], INVALID_TIMESTAMPTORETURN, null, expectedFail, false ) )
    {
        print( "Read Results:\n\t" + ReadHelper.ValuesToString() );
    }
}

safelyInvoke( read581Err022 );