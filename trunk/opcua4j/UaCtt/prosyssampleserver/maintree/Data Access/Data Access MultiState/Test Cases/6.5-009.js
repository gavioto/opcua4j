/*  Test 6.5 Test 9; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Browse a node of this type requesting all Forward and Inverse references.
    Expectations:
        Service and operation level results are good.
        Verify references returned are valid.
        The results should be a combination of the individual Forward and Inverse requests (previous 2 test-cases).

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

    const MIN_REFERENCE_COUNT_FORWARD = 2;
    const MIN_REFERENCE_COUNT_INVERSE = 1;

    var forwardRefs = GetIsDirectionReferences( multiStateItems[0].NodeId, BrowseDirection.Forward, g_session );
    addLog( "ForwardRefs found: " + forwardRefs.length + "; Wanted " + MIN_REFERENCE_COUNT_FORWARD + " or more." );
    AssertGreaterThan( (MIN_REFERENCE_COUNT_FORWARD-1), forwardRefs.length, "Expected more than " + MIN_REFERENCE_COUNT_FORWARD + " references!" );
    AssertReferencesContainsBrowseName( forwardRefs, "EnumStrings", "EnumStrings Variable reference expected!" );

    var inverseRefs = GetIsDirectionReferences( multiStateItems[0].NodeId, BrowseDirection.Inverse, g_session );
    addLog( "InverseRefs found: " + inverseRefs.length + "; Wanted " + MIN_REFERENCE_COUNT_INVERSE + " or more." );
    AssertGreaterThan( (MIN_REFERENCE_COUNT_INVERSE-1), inverseRefs.length, "Expected more than " + MIN_REFERENCE_COUNT_INVERSE + " references!" );

    var bothRefs = GetDefaultReferencesFromNodeId( g_session, multiStateItems[0].NodeId, undefined, BrowseDirection.Both );
    addLog( "bothRefs found: " + bothRefs.length + "; Wanted (" + forwardRefs.length + "+" + inverseRefs.length + ") " + ( forwardRefs.length + inverseRefs.length ) + " references." );
    if( AssertEqual( (forwardRefs.length + inverseRefs.length), bothRefs.length, "Expected the BrowseDirection.BOTH results [size=" + bothRefs.length + "] to equal the sum of both FORWARD [size: " + forwardRefs.length + "] and INVERSE [size: " + inverseRefs.length + "] results!" ) )
    {
        // now to check that ALL of the references in the FIRST and SECOND calls, exist in the THIRD call
        for( var f=0; f<forwardRefs.length; f++ )
        {
            AssertReferencesContainsBrowseName( bothRefs, forwardRefs[f].BrowseName.Name, forwardRefs[f].BrowseName.Name + " Variable reference expected!" );
        }
        for( var i=0; i<inverseRefs.length; i++ )
        {
            AssertReferencesContainsBrowseName( bothRefs, inverseRefs[i].BrowseName.Name, inverseRefs[i].BrowseName.Name + " Variable reference expected!" );
        }
    }
}

safelyInvoke( browse65007 );