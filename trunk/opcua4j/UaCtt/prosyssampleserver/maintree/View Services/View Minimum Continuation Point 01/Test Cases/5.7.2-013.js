/*    Test 5.7.2-13 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the node has at least two View references
            And RequestedMaxReferencesPerNode is 1
            And NodeClassMask is set to 128 (View)
            And Browse has been called
          When BrowseNext is called
            And ReleaseContinuationPoints is false
          Then the server returns the second reference
            And ContinuationPoint is not empty

          Validation is accomplished by first browsing all references matching 
          the node class, then performing the test and comparing the second 
          reference to the reference returned by the BrowseNext call. So this
          test only validates that Browse two references is consistent with 
          Browse one reference followed by BrowseNext.

      Revision History:
          2009-09-09 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED/INCONCLUSIVE. OPCF UA Sample Server doesn't support views.
*/

include( "./library/ServiceBased/ViewServiceSet/BrowseNext/node_class_mask_test.js" );

// Return the NodeId of a node that has two View references.
// Start looking under /Views. The Views can be in either direction.
function GetNodeWithTwoViews( session, nodeToBrowse )
{
    //var nodeId = UaNodeId.fromString( "NS0 | IdentifierTypeNumeric | 87" );
    var references = GetTest1ReferencesFromNodeId( session, nodeToBrowse );
    var count = 0;
    for( var i = 0; i < references.length; i++ )
    {
        if( references[i].NodeClass == NodeClass.View )
        {
            count++;
            if( count >= 2 )
            {
                return nodeToBrowse;
            }
        }
    }

    // we didn't find two Views, but lets check the Forward nodes
    references = GetDefaultReferencesFromNodeId( session, nodeToBrowse );
    for( var i = 0; i < references.length; i++ )
    {
        nodeWithViews = GetNodeWithTwoViews( session, references[i].NodeId.NodeId );
        if( nodeWithViews != -1 )
        {
            return nodeWithViews;
        }
    }

    return -1;
}

// BrowseNext for references matching a NodeClassMask
function Test572010()
{
    var nodesToBrowse = [
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasView" ).toString() ),
        ];

    if( nodesToBrowse == null || nodesToBrowse[0] == null )
    {
        addWarning( "[Configuration Issue?] Cannot perform test. Verify setting '/Server Test/NodeIds/NodeClasses/HasView'." );
        return;
    }

    /* Pairwise tests of NodeClassMask
    TestBrowseNextWhenMoreNodeClassReferencesExist( nodesToBrowse[0], 0x7E, nodesToBrowse, 0 );
    TestBrowseNextWhenMoreNodeClassReferencesExist( nodesToBrowse[1], 0x55, nodesToBrowse, 0 );
    TestBrowseNextWhenMoreNodeClassReferencesExist( nodesToBrowse[0], 0x2B, nodesToBrowse, 0 );
    TestBrowseNextWhenMoreNodeClassReferencesExist( nodesToBrowse[0], 0x06, nodesToBrowse, 0 );
    TestBrowseNextWhenMoreNodeClassReferencesExist( nodesToBrowse[3], 0x78, nodesToBrowse, 0 );
    TestBrowseNextWhenMoreNodeClassReferencesExist( nodesToBrowse[3], 0x18, nodesToBrowse, 0 );
    TestBrowseNextWhenMoreNodeClassReferencesExist( nodesToBrowse[6], 0x60, nodesToBrowse, 0 );
    */

    // determine if the server supports views
    if( !ServerHasViews( Session ) )
    {
        addSkipped( "Server does not have Views. This test will not be run." );
        return;
    }

    // determine if there are at least two Views on one node
    var nodeWithViews = -1
    try 
    {
        nodeWithViews = GetNodeWithTwoViews( Session, notesToBrowse[0] );
    }
    catch ( exception )
    {
        // stack might overflow
        addWarning( "Could not find a node containing two Views. This test will not be run." );
        return;
    }
    if( nodeWithViews == -1 )
    {
        addWarning( "Server does not have a node containing two Views. This test will not be run." );
        return;
    }

    var nodeClassMask = 128;
    addLog( "Testing nodeClassMask <" + nodeClassMask + ">" );
    TestBrowseNextWhenMoreNodeClassReferencesExist( nodeWithViews, nodeClassMask );
}

safelyInvoke( Test572010 );