/*    Test 6.3 Test 13 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one existent starting node of AnalogItemType type
            And one relativePath element referring to InstrumentRange
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns the NodeId of the InstrumentRange
            Or the server returns operation result BadNoMatch
            Or the server returns service result BadServiceUnsupported

          Given one existent starting node of AnalogItemType type
            And one relativePath element referring to EngineeringUnits
          When TranslateBrowsePathsToNodeIds is called
          Then the server returns the NodeId of the EngineeringUnits
            Or the server returns operation result BadNoMatch
            Or the server returns service result BadServiceUnsupported

      Revision History:
          11-Feb-2010 Dale Pope: Initial version.
          04-Mar-2010 NP: REVIEWED.
*/

/*globals addError, CreateQualifiedNamesArrayFromString, CreateNodeIdsArrayFromString,
  include, NodeIdSettings, TestBrowsePathTranslatesOrFails
*/

include( "./library/ServiceBased/ViewServiceSet/TranslateBrowsePathsToNodeIds/test_browse_paths_translate_or_fail.js" );

function analog613013()
{
    var startingNode = NodeIdSettings.GetAStaticAnalogNodeIdSetting();
    if( startingNode === null )
    {
        addSkipped( "Static Analog" );
        return;
    }
    var testNode = new UaNodeId( Identifier.HasProperty );
    TestBrowsePathTranslatesOrFails( [startingNode.id], [CreateQualifiedNamesArrayFromString( "0:InstrumentRange"  )], [[testNode]] );
    TestBrowsePathTranslatesOrFails( [startingNode.id], [CreateQualifiedNamesArrayFromString( "0:EngineeringUnits" )], [[testNode]] );
}

safelyInvoke( analog613013 );