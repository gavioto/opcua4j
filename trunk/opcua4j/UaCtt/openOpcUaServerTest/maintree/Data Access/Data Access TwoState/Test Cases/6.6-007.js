/*  Test 6.6 Test 7; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Browse a node of this type and query the forward references.
        Then browse a node of this type and query the inverse references.
        Then browse a node of this type and query both forward and inverse references.

    Expectations:
        Service and operation level results are Good.
        2 or more References exist for first call, and the TrueState and FalseState
        variables references are returned.
        1 or more references exist for the 2nd call.
        All references returned in the previous 2 calls are returned for the 3rd call.

    Revision History:
        17-Feb-2010 NP: Initial version.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function browse66007()
{
    if( twoStateItems == null || twoStateItems.length == 0 )
    {
        addSkipped( TSDT );
        return;
    }

    const MIN_REFERENCE_COUNT_FORWARD = 2;
    const MIN_REFERENCE_COUNT_INVERSE = 1;

    var forwardRefs = GetIsDirectionReferences( twoStateItems[0].NodeId, BrowseDirection.Forward, g_session );
    addLog( "forwardRefs.length = " + forwardRefs.length + "; Wanted " + MIN_REFERENCE_COUNT_FORWARD + " or more." );
    AssertGreaterThan( ( MIN_REFERENCE_COUNT_FORWARD - 1 ), forwardRefs.length, "Expected more than " + MIN_REFERENCE_COUNT_FORWARD + " references!" );
    AssertReferencesContainsBrowseName( forwardRefs, "TrueState",  "TrueState Variable reference expected!" );
    AssertReferencesContainsBrowseName( forwardRefs, "FalseState", "FalseState Variable reference expected!" );

    var inverseRefs = GetIsDirectionReferences( twoStateItems[0].NodeId, BrowseDirection.Inverse, g_session );
    addLog( "inverseRefs.length = " + inverseRefs.length + "; Wanted " + MIN_REFERENCE_COUNT_INVERSE + " or more." );
    AssertGreaterThan( ( MIN_REFERENCE_COUNT_INVERSE - 1 ), inverseRefs.length, "Expected more than " + MIN_REFERENCE_COUNT_INVERSE + " references!" );

    var bothRefs = GetDefaultReferencesFromNodeId( g_session, twoStateItems[0].NodeId, undefined, BrowseDirection.Both );
    addLog( "bothRefs.length = " + bothRefs.length );
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

safelyInvoke( browse66007 );