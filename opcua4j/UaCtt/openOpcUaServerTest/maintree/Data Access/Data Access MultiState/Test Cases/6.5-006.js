/*  Test 6.5 Test 6; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Browse for the EnumStrings variable.

    Expectations:
        All service and operation level results are Good.

    Revision History:
        08-Mar-2010 NP: Initial version.
        04-Feb-2011 NP: Removed a check that the # of References was >= 2 (not in the test-case definition).

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function browse65006()
{
    var forwardRefs = GetIsDirectionReferences( multiStateItems[0].NodeId, BrowseDirection.Forward, g_session );
    print( "forwardRefs.length = " + forwardRefs.length );
    if( AssertReferencesContainsBrowseName( forwardRefs, "EnumStrings",  "TrueState Variable reference expected!" ) )
    {
        addLog( "EnumStrings found!" );
    }
}

safelyInvoke( browse65006 );