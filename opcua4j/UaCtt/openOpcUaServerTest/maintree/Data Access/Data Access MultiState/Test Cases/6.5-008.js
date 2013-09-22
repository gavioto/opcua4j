/*  Test 6.5 Test 8; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Browse a node of this type requesting all INVERSE references.
    Expectations:
        Service and operation level results are good.

    Revision History:
        08-Mar-2010 NP: Initial version.
        04-Feb-2011 NP: Corrected assertion to use >= instead of > (credit: MI)

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function browse65007()
{
    if( multiStateItems == null || multiStateItems.length == 0 )
    {
        addSkipped( "TwoStateDiscreteItems" );
        return;
    }

    const MIN_REFERENCE_COUNT_INVERSE = 1;

    var inverseRefs = GetIsDirectionReferences( multiStateItems[0].NodeId, BrowseDirection.Inverse, g_session );
    print( "inverseRefs.length = " + inverseRefs.length );
    AssertGreaterThan( (MIN_REFERENCE_COUNT_INVERSE-1), inverseRefs.length, "Expected more than " + MIN_REFERENCE_COUNT_INVERSE + " references!" );
    for( var r=0; r<inverseRefs.length; r++ )
    {
        addLog( "Found Inverse Reference: BrowseName='" + inverseRefs[r].BrowseName + "'; RefTypeId: " + inverseRefs[r].ReferenceTypeId );
    }
}

safelyInvoke( browse65007 );