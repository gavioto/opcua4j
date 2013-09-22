/*    Test 5.7.1-19 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node has references of node classes Object and Variable
          When Browse is called
          Then the server returns non-null Reference Description fields

      Revision History:
          2009-09-01 Dale Pope: Initial version.
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. UA Server nodes to be found to meet all search criteria.
          2010-12-17 NP: Script only tests those settings that are configured.
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/lookup_node_class_name.js" );

// Browse the given node and validate that the Reference Description fields are correctly null or not null.
function BrowseOneNodeAndValidateReferenceFields( nodeToBrowse, returnDiagnostics  )
{
    addLog( "Testing ReferenceDescription field population on node <" + nodeToBrowse + "> with returnDiagnostics <" + returnDiagnostics + ">" );

    var allReferences = GetTest1ReferencesFromNodeId( Session, nodeToBrowse );
    if( allReferences.length == 0 )
    {
        addError( "Test cannot be completed: the node <" + nodeToBrowse + "> must have at least one reference." );
        return -1;
    }

    var testedNodeClasses = 0;

    // check references for all fields
    for( var i = 0; i < allReferences.length; i++ )
    {
        var reference = allReferences[i];
        var referenceText = "References[" + i + "].";

        // these fields should all be non-null
        AssertNotNullNodeId( reference.ReferenceTypeId, referenceText + "ReferenceTypeId is a null NodeId" );
        if( reference.IsForward == null )
        {
            addError( referenceText + "IsForward is null" )
        }
        if( ( reference.NodeClass == null ) || ( reference.NodeClass == 0 ) )
        {
            addError( referenceText + "NodeClass is null or invalid: " + reference.NodeClass )
        }
        AssertNotNullQualifiedName( reference.BrowseName, referenceText + "BrowseName is null or empty" );
        AssertNotNullLocalizedText( reference.DisplayName, referenceText + "DisplayName is null or empty" );
        
        // this field should be null unless the class is Object, Variable or method
        if( ( reference.NodeClass & NodeClass.Object ) || ( reference.NodeClass & NodeClass.Variable ) )
        {
            AssertNotNullExpandedNodeId( reference.TypeDefinition, referenceText + "TypeDefinition is null or empty on NodeClass " + LookupNodeClassName( reference.NodeClass ) );
        }
        else if( reference.NodeClass & NodeClass.Method )
        {
            // methods are trickier because they MIGHT have a referenceTypeId.
            // so in this case we will not actually check since its optional!
        }
        else
        {
            AssertNullExpandedNodeId( reference.TypeDefinition, referenceText + "TypeDefinition is not null or empty on NodeClass '" + LookupNodeClassName( reference.NodeClass ) + "'. Type Definition reads: '" + reference.TypeDefinition + "'." );
        }
        
        testedNodeClasses = testedNodeClasses | reference.NodeClass;
    }

    return testedNodeClasses;
}


// The test
function Test571019()
{
    if( nodeClassItems.length !== NodeIdSettings.NodeClasses().length )
    {
        addWarning( "Some NodeClasses will not be tested because they are not configured within the settings." );
    }

    var nodesToBrowse = [
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasObject" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasVariable" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasMethod" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasObjectType" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasVariableType" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasReferenceType" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasDataType" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasView" ).toString() )
        ];

    var testedNodeClasses = 0;
    for( var i=0; i<nodesToBrowse.length; i++ )
    {
        // make sure the node to browse is not null
        if( nodesToBrowse[i] !== undefined && nodesToBrowse[i] !== null )
        {
            testedNodeClasses = testedNodeClasses | BrowseOneNodeAndValidateReferenceFields( nodesToBrowse[i], 0 );
        }
    }

    if( testedNodeClasses == 127 )
    {
        addLog( "Tested all node classes except Views" );
    }
    else if( testedNodeClasses == 255 )
    {
        addLog( "Tested all node classes" );
    }
    else
    {
        addWarning( "Did not test all required node classes. Node classes tested (bit mask): " + testedNodeClasses );
    }
}

safelyInvoke( Test571019 );