/*  Test 6.5 Test 7; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Browse a node of this type requesting all Forward references.
    Expectations:
        Service and operation level results are good.
        HasTypeDefinition reference points to NodeId 2376 (Identifier. MultiStateDiscreteType 2376).
        If a HasModelParent reference is returned then verify its validity.

    Revision History:
        08-Mar-2010 NP: Initial version.
        04-Feb-2011 NP: Revised to use new Assertions. Also, to check for an OPTIONAL hasModelParent. (Credit: MI)

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

    var forwardRefs = GetIsDirectionReferences( multiStateItems[0].NodeId, BrowseDirection.Forward, g_session );
    if( AssertReferencesContainsBrowseName( forwardRefs, "MultiStateDiscreteType", "Expected to find a Forward Reference of type 'MultiStateDiscreteType'" ) )
    {
        addLog( "Found a Forward Reference to 'MultiStateDiscreteType' - as expected." );
    }
    if( AssertReferencesContainsReferenceTypeId( forwardRefs, new UaNodeId( Identifier.HasModelParent ), "Skipping validation of 'HasModelParent' reference, which is not defined for this node.", true ) )
    {
        addLog( "Found a Forward Reference to 'HasModelParent' - which is optional." );
    }
}

safelyInvoke( browse65007 );