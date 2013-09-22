/*  Test 2 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Script walks through the Servers' address space checking each node
        complies with the Base NodeClass, as defined in UA Specifications
        PART 3 Clause 5.2.1 Table 2 (Base NodeClass) which defines the following
        attributes:
            REQUIRED: NodeId, NodeClass, BrowseName, and DisplayName
            OPTIONAL: Description, WriteMask, UserWriteMask.

    Revision History
        25-May-2011 NP: Initial version.

    WARNING: THIS SCRIPT MAY TAKE A *LONG TIME* TO COMPLETE IF YOUR SERVER'S ADDRESS SPACE IS LARGE
*/

const MAX_NODES_TO_TEST = 200;

// define our Base NodeClass 
var baseNodeClassDefinition = new IM_NodeClassDefinition(
    "Base NodeClass - not to be used directly",
    [
        new IM_AttributeDetail( "NodeId", Attribute.NodeId, Identifier.NodeId, REQUIRED ),
        new IM_AttributeDetail( "NodeClass", Attribute.NodeClass, Identifier.NodeClass, REQUIRED ),
        new IM_AttributeDetail( "BrowseName", Attribute.BrowseName, Identifier.QualifiedName, REQUIRED ),
        new IM_AttributeDetail( "DisplayName", Attribute.DisplayName, Identifier.LocalizedText, REQUIRED ),
        new IM_AttributeDetail( "Description", Attribute.Description, Identifier.LocalizedText, OPTIONAL ),
        new IM_AttributeDetail( "WriteMask", Attribute.WriteMask, Identifier.UInt32, OPTIONAL ),
        new IM_AttributeDetail( "UserWriteMask", Attribute.UserWriteMask, Identifier.UInt32, OPTIONAL )
        ] );


// define our base REFERENCE class, inherits attributes from NodeClass (above)
// UA Specifications Part 3 TABLE 4
var baseReferenceTypeDefinition = new IM_NodeClassDefinition(
    "ReferenceType NodeClass",
    baseNodeClassDefinition.Attributes.concat([
        new IM_AttributeDetail( "IsAbstract", Attribute.IsAbstract, Identifier.Boolean, REQUIRED ),
        new IM_AttributeDetail( "Symmetric", Attribute.Symmetric, Identifier.Boolean, REQUIRED ),
        new IM_AttributeDetail( "InverseName", Attribute.InverseName, Identifier.LocalizedText, OPTIONAL )
    ]),
    [
        new IM_ReferenceDefinition( "HasProperty", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasProperty ) ), 
        new IM_ReferenceDefinition( "HasSubType", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasSubtype ) )
    ],
    [
        new IM_PropertyDefinition( "NodeVersion", OPTIONAL, Identifier.String )
    ] );


// define our base VIEW class, inherits attributes from NodeClass (above)
// UA Specifications Part 3 TABLE 5
var baseViewDefinition = new IM_NodeClassDefinition(
    "View NodeClass",
    baseNodeClassDefinition.Attributes.concat([
        new IM_AttributeDetail( "ContainsNoLoops", Attribute.ContainsNoLoops, Identifier.Boolean, REQUIRED ),
        new IM_AttributeDetail( "EventNotifier", Attribute.EventNotifier, Identifier.Byte, REQUIRED )
    ]),
    [
        new IM_ReferenceDefinition( "HierarchicalReferences", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HierarchicalReferences ) ), 
        new IM_ReferenceDefinition( "HasProperty", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasProperty ) )
    ],
    [
        new IM_PropertyDefinition( "NodeVersion", OPTIONAL, Identifier.String ),
        new IM_PropertyDefinition( "ViewVersion", OPTIONAL, Identifier.UInt32 )
    ] );


// define our base OBJECT class, inherits attributes from NodeClass (above)
// UA Specifications Part 3 TABLE 6
var baseObjectDefinition = new IM_NodeClassDefinition(
    "Object NodeClass",
    baseNodeClassDefinition.Attributes.concat([
        new IM_AttributeDetail( "EventNotifier", Attribute.EventNotifier, Identifier.Byte, REQUIRED )
    ]),
    [
        new IM_ReferenceDefinition( "HasComponent", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasComponent ) ), 
        new IM_ReferenceDefinition( "HasProperty", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasProperty ) ), 
        new IM_ReferenceDefinition( "HasModellingRule", OPTIONAL, 0, 1, new UaNodeId( Identifier.HasModellingRule ) ), 
        new IM_ReferenceDefinition( "HasTypeDefinition", REQUIRED, 1, 1, new UaNodeId( Identifier.HasTypeDefinition ) ), 
        new IM_ReferenceDefinition( "HasModelParent", OPTIONAL, 0, 1, new UaNodeId( Identifier.HasModelParent ) ), 
        new IM_ReferenceDefinition( "HasEventSource", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasEventSource ) ), 
        new IM_ReferenceDefinition( "HasNotifier", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasNotifier ) ), 
        new IM_ReferenceDefinition( "Organizes", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.Organizes ) ), 
        new IM_ReferenceDefinition( "HasDescription", OPTIONAL, 0, 1, new UaNodeId( Identifier.HasDescription ) )
    ],
    [
        new IM_PropertyDefinition( "NodeVersion", OPTIONAL, Identifier.String ),
        new IM_PropertyDefinition( "Icon", OPTIONAL, Identifier.Image ),
        new IM_PropertyDefinition( "NamingRule", OPTIONAL, Identifier.NamingRuleType )
    ]);


// define our Base Variable, inherits attributes from NodeClass (above)
// UA Specifications Part 3 TABLE 7
var baseObjectTypeDefinition = new IM_NodeClassDefinition(
    "ObjectType NodeClass",
    baseNodeClassDefinition.Attributes.concat([
        new IM_AttributeDetail( "IsAbstract", Attribute.IsAbstract, Identifier.Boolean, REQUIRED )
    ]),
    [
        new IM_ReferenceDefinition( "HasComponent", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasComponent ) ), 
        new IM_ReferenceDefinition( "HasProperty", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasProperty ) ), 
        new IM_ReferenceDefinition( "HasSubType", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasSubtype ) ), 
        new IM_ReferenceDefinition( "GeneratesEvent", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.GeneratesEvent ) )
    ],
    [
        new IM_PropertyDefinition( "NodeVersion", OPTIONAL, Identifier.String ),
        new IM_PropertyDefinition( "Icon", OPTIONAL, Identifier.Image )
    ]);


// define our Base Variable, inherits attributes from NodeClass (above)
// UA Specifications Part 3 TABLE 8
var baseVariableDefinition = new IM_NodeClassDefinition( 
    "Variable NodeClass",
    baseNodeClassDefinition.Attributes.concat([
        new IM_AttributeDetail( "Value", Attribute.Value, Identifier.BaseDataType, REQUIRED ),
        new IM_AttributeDetail( "DataType", Attribute.DataType, Identifier.NodeId, REQUIRED ),
        new IM_AttributeDetail( "ValueRank", Attribute.ValueRank, Identifier.Int32, REQUIRED ),
        new IM_AttributeDetail( "ArrayDimensions", Attribute.ArrayDimensions, Identifier.UInt32, REQUIRED, ARRAY ),
        new IM_AttributeDetail( "AccessLevel", Attribute.AccessLevel, Identifier.Byte, REQUIRED ),
        new IM_AttributeDetail( "UserAccessLevel", Attribute.UserAccessLevel, Identifier.Byte, REQUIRED ),
        new IM_AttributeDetail( "MiminumSamplingInterval", Attribute.MinimumSamplingInterval, Identifier.Duration, OPTIONAL ),
        new IM_AttributeDetail( "Historizing", Attribute.Historizing, Identifier.Boolean, REQUIRED )
    ]),
    [
        new IM_ReferenceDefinition( "HasModellingRule", OPTIONAL, 0, 1, new UaNodeId( Identifier.HasModellingRule ) ), 
        new IM_ReferenceDefinition( "HasProperty", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasProperty ) ),
        new IM_ReferenceDefinition( "HasComponent", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasComponent ) ),
        new IM_ReferenceDefinition( "HasTypeDefinition", OPTIONAL, 1, 1, new UaNodeId( Identifier.HasTypeDefinition ) ),
        new IM_ReferenceDefinition( "HasModelParent", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasModelParent ) )
    ],
    [
        new IM_PropertyDefinition( "NodeVersion", OPTIONAL, Identifier.String ),
        new IM_PropertyDefinition( "LocalTime", OPTIONAL, Identifier.TimeZoneDataType ),
        new IM_PropertyDefinition( "DataTypeVersion", OPTIONAL, Identifier.String ),
        new IM_PropertyDefinition( "DictionaryFragment", OPTIONAL, Identifier.ByteString ),
        new IM_PropertyDefinition( "AllowNulls", OPTIONAL, Identifier.Boolean )
    ] );


// define our Base VariableType, inherits attributes from NodeClass (above)
// UA Specifications Part 3 TABLE 9
var baseVariableTypeDefinition = new IM_NodeClassDefinition( 
    "VariableType NodeClass",
    baseNodeClassDefinition.Attributes.concat([
        new IM_AttributeDetail( "Value", Attribute.Value, Identifier.BaseDataType, OPTIONAL ),
        new IM_AttributeDetail( "DataType", Attribute.DataType, Identifier.NodeId, REQUIRED ),
        new IM_AttributeDetail( "ValueRank", Attribute.ValueRank, Identifier.Int32, REQUIRED ),
        new IM_AttributeDetail( "ArrayDimensions", Attribute.ArrayDimensions, Identifier.UInt32, OPTIONAL, ARRAY ),
        new IM_AttributeDetail( "IsAbstract", Attribute.IsAbstract, Identifier.Boolean, REQUIRED )
    ]),
    [
        new IM_ReferenceDefinition( "HasProperty", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasProperty ) ),
        new IM_ReferenceDefinition( "HasComponent", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasComponent ) ),
        new IM_ReferenceDefinition( "HasSubType", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasSubtype ) ),
        new IM_ReferenceDefinition( "GeneratesEvent", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.GeneratesEvent ) )
    ],
    [
        new IM_PropertyDefinition( "NodeVersion", OPTIONAL, Identifier.String )
    ] );


// define our Base Method, inherits attributes from NodeClass (above)
// UA Specifications Part 3 TABLE 10
var baseMethodDefinition = new IM_NodeClassDefinition( 
    "Method NodeClass",
    baseNodeClassDefinition.Attributes.concat([
        new IM_AttributeDetail( "Executable", Attribute.Executable, Identifier.Boolean, REQUIRED ),
        new IM_AttributeDetail( "UserExecutable", Attribute.Executable, Identifier.Boolean, REQUIRED )
        ] ),
    [
        new IM_ReferenceDefinition( "HasProperty", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasProperty ) ),
        new IM_ReferenceDefinition( "HasModellingRule", OPTIONAL, 0, 1, new UaNodeId( Identifier.HasModellingRule ) ), 
        new IM_ReferenceDefinition( "HasModelParent", OPTIONAL, 0, 1, new UaNodeId( Identifier.HasModelParent ) ),
        new IM_ReferenceDefinition( "GeneratesEvent", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.GeneratesEvent ) ),
        new IM_ReferenceDefinition( "AlwaysGeneratesEvent", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.AlwaysGeneratesEvent ) )
    ],
    [
        new IM_PropertyDefinition( "NodeVersion", OPTIONAL, Identifier.String ),
        new IM_PropertyDefinition( "InputArguments", OPTIONAL, Identifier.Argument, ARRAY ),
        new IM_PropertyDefinition( "OutputArguments", OPTIONAL, Identifier.Argument, ARRAY )
    ] );


// define our Base Method, inherits attributes from NodeClass (above)
// UA Specifications Part 3 TABLE 11
var baseDataTypeDefinition = new IM_NodeClassDefinition( 
    "DataType NodeClass",
    baseNodeClassDefinition.Attributes.concat([
        new IM_AttributeDetail( "IsAbstract", Attribute.IsAbstract, Identifier.Boolean, REQUIRED )
        ] ),
    [
        new IM_ReferenceDefinition( "HasProperty", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasProperty ) ),
        new IM_ReferenceDefinition( "HasSubType", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasSubtype ) ), 
        new IM_ReferenceDefinition( "HasEncoding", OPTIONAL, 0, Infinity, new UaNodeId( Identifier.HasEncoding ) )
    ],
    [
        new IM_PropertyDefinition( "NodeVersion", OPTIONAL, Identifier.String ),
        new IM_PropertyDefinition( "EnumStrings", OPTIONAL, Identifier.LocalizedText, ARRAY )
    ] );


/* Simple factory pattern that receives a Node for testing and will determine which form of validation 
   the node should receive based on its NodeClass value (which defines the TYPE of node).

   Arguments:
       nodeToTest:    the MonitoredItem object that will receive testing.

    Revision History
        25-May-2011 NP: Initial version.
*/
function factoryNodeValidator( nodeMask )
{
    var result = null;
    // blanket use of one form of validation for now
    switch( nodeMask )
    {
        case NodeClass.Unspecified:
            addError( "NodeClass 'unspecified' is not legal!" );
            break;
        case NodeClass.Object:
            result = baseObjectDefinition;
            break;
        case NodeClass.Variable: 
            result = baseVariableDefinition;
            break;
        case NodeClass.Method: 
            result = baseMethodDefinition;
            break;
        case NodeClass.ObjectType: 
            result = baseObjectTypeDefinition;
            break;
        case NodeClass.VariableType: 
            result = baseVariableTypeDefinition;
            break;
        case NodeClass.ReferenceType: 
            result = baseReferenceTypeDefinition;
            break;
        case NodeClass.DataType:
            result = baseDataTypeDefinition;
            break;
        case NodeClass.View:
            result = baseViewDefinition;
            break;
    }
    if( result === null )
    {
        addError( "factoryNodeValidator couldn't return a validator for NodeClass " + NodeClass.toString( NodeClass ) );
    }
    return( result );
}


function walkThruAddressSpace()
{
    resetWalkthroughTest( MAX_NODES_TO_TEST );// called in NodeIsOfCompliantType.js; allows walkthrough to occur.
    // define the root item, that is our starting point... we know its data type too!
    var rootItem = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.RootFolder ), 1 )[0];
    rootItem.NodeClass = NodeClass.Object;
    // recursively walk through the servers address space
    ReadNode( rootItem );
}

safelyInvoke( walkThruAddressSpace );