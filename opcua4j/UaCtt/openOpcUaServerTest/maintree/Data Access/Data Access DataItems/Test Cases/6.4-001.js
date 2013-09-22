/*  Test 6.4 Test #1, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
          Given one existent starting node of DataItem type
            And one relativePath element referring to Definition
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns the NodeId of the Definition
            Or the server returns operation result BadNoMatch
            Or the server returns service result BadServiceUnsupported

          Given one existent starting node of DataItem type
            And one relativePath element referring to ValuePrecision
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns the NodeId of the ValuePrecision
            Or the server returns operation result BadNoMatch
            Or the server returns service result BadServiceUnsupported

    Revision History: 
        19-Feb-2010 Anand Taparia: Initial version (based entirely on script 6.1.3-013 by Dale Pope)
        03-Mar-2010 NP: REVIEWED. Inconclusive.
        07-Mar-2010 Anand Taparia: Script now also performs the datatype check as per the test case.
*/
/*globals addError, CreateQualifiedNamesArrayFromString, CreateNodeIdsArrayFromString,
  include, NodeIdSettings, TestBrowsePathTranslatesOrFails
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_browse_paths_translate_or_fail.js" );

function browse614001 ()
{
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem(), 1 );
    if ( monitoredItems.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }
    
    TestBrowsePathTranslatesOrFails( [monitoredItems[0].NodeId], [CreateQualifiedNamesArrayFromString( "0:Definition" )], [[new UaNodeId( Identifier.HasProperty )]], [ BuiltInType.String ] );
    TestBrowsePathTranslatesOrFails( [monitoredItems[0].NodeId], [CreateQualifiedNamesArrayFromString( "0:ValuePrecision" )], [[new UaNodeId( Identifier.HasProperty )]], [ BuiltInType.Double ] );
}

safelyInvoke ( browse614001 );