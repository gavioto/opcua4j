/*  Test 5.8.1 Error Test 1; prepared by Development; compliance@opcfoundation.org

    Description:
        Read an invalid attribute from a valid node.

    Revision History
        24-Aug-2009 Dev: Initial version.
        11-Nov-2009 NP:  Revised to new Script library objects.
        11-Nov-2009 NP:  REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581Err001()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, Attribute.Executable, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }
    var expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.BadAttributeIdInvalid ) ];
    ReadHelper.Execute( items[0], TimestampsToReturn.Both, 100, expectedResults, true );
}

safelyInvoke( read581Err001 );