/*    Test 5.7.1-18 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node has a View
            And the nodeClassMask is set to the View node class
          When Browse is called
          Then the server returns View references

          If the Server has no Views (under /Views), then the test
          is not run.

          Validation is accomplished by first browsing all references on a node
          with nodeClassMask = 0xFF, storing the found references, and comparing
          them to the nodeClassMask.
          
          Test once with a node that has a View reference. If the node does not
          also have references of a different node class, then perform another
          test where references of a different node class do exist.

      Revision History:
          2009-08-31 Dale Pope: Initial version.
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. The OPCF UA Sample Server not configured with Views.
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/node_class_mask_test.js" );

// The test
function Test571018()
{
    var nodeWithView = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasView" ).toString() );
    
    var alternateNodes = [
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasObject" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasVariable" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasMethod" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasObjectType" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasVariableType" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasReferenceType" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasDataType" ).toString() )
        ];

    // determine if the server supports views
    if( !ServerHasViews( Session ) )
    {
        addWarning( "Server does not have Views. This test will not be run." );
        return;
    }

    var nodeClassMask = 128;
    addLog( "Testing nodeClassMask <" + nodeClassMask + "> with returnDiagnositcs <0>" );
    BrowseOneNodeWithClassMaskMatchAndNoMatch( nodeWithView, nodeClassMask, alternateNodes, 0 );
    
    addLog( "Testing nodeClassMask <" + nodeClassMask + "> with returnDiagnositcs <0x3FF>" );
    BrowseOneNodeWithClassMaskMatchAndNoMatch( nodeWithView, nodeClassMask, alternateNodes, 0x3FF );
}

safelyInvoke( Test571018 );