/*    Class object is a helper class for gaining easy access to the various
      NodeIds defined within the settings.
      
      Nathan Pocock; nathan.pocock@opcfoundation.org
*/
/*globals addError, AddNodeIdSettingToUniqueArray, ArrayContains, BuiltInType, include,
  NodeIdSetting, readSetting, UaNodeId
*/

include( "./library/Base/SettingsUtilities/NodeIdSetting.js" );


function NodeIdSettings()
{
}

// From an array of settings, return an array of each unique parent setting.
// E.g., from: /Server Test/NodeIds/Scalar/NodeId1,/Server Test/NodeIds/Scalar/NodeId2
//       return: /Server Test/NodeIds/Scalar
NodeIdSettings.GetUniqueSettingsParents = function( settings )
{
    var parentSetting;
    var parentSettings = [];
    var i;
    for( i = 0; i < settings.length; i++ )
    {
        parentSetting = settings[i].match( /(.*\/)/ );
        if( !ArrayContains( parentSettings, parentSetting[1] ) )
        {
            parentSettings.push( parentSetting[1] );
        }
    }
    return parentSettings;
};

// The following functions reference the names of settings and returns them as 
// an array of string.
// NOT INTENDED FOR EXTERNAL USE. INTENDED FOR INTERNAL USE ONLY.
NodeIdSettings.ScalarStatic = function()
{
    return( [
    "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/Double",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/Float",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/String",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/SByte",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/XmlElement",
    "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64"
    ] );
};
NodeIdSettings.ScalarStaticAll = function()
{
    return NodeIdSettings.ScalarStatic();
};

NodeIdSettings.ArraysStatic  = function()
{
    return( [
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Bool",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Byte",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/ByteString",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/DateTime",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Double",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Float",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Guid",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Int16",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Int32",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Int64",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/SByte",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/String",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt16",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt32",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt64",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/XmlElement"
    ] );
};

NodeIdSettings.ArraysStaticNumeric  = function()
{
    return( [
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Byte",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Double",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Float",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Int16",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Int32",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/Int64",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/SByte",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt16",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt32",
    "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt64"
    ] );
};

NodeIdSettings.ArraysDAAnalogType= function()
{
    return( [
        "/Server Test/NodeIds/Static/DA Profile/AnalogType Arrays/Int16",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType Arrays/Int32",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType Arrays/UInt16",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType Arrays/UInt32",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType Arrays/Float"
    ] );
};
NodeIdSettings.DAAStaticDataItem = function()
{
    return( [
        "/Server Test/NodeIds/Static/DA Profile/DataItem/Byte",
        "/Server Test/NodeIds/Static/DA Profile/DataItem/DateTime",
        "/Server Test/NodeIds/Static/DA Profile/DataItem/Double",
        "/Server Test/NodeIds/Static/DA Profile/DataItem/Float",
        "/Server Test/NodeIds/Static/DA Profile/DataItem/Int16",
        "/Server Test/NodeIds/Static/DA Profile/DataItem/UInt16",
        "/Server Test/NodeIds/Static/DA Profile/DataItem/Int32",
        "/Server Test/NodeIds/Static/DA Profile/DataItem/UInt32",
        "/Server Test/NodeIds/Static/DA Profile/DataItem/Int64",
        "/Server Test/NodeIds/Static/DA Profile/DataItem/UInt64",
        "/Server Test/NodeIds/Static/DA Profile/DataItem/SByte",
        "/Server Test/NodeIds/Static/DA Profile/DataItem/String"
    ] );
};
NodeIdSettings.DAStaticAnalog = function()
{
    return( [
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/Double",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/Float",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/Int16",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/UInt16",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/Int32",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/UInt32",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/Int64",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/UInt64",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/Byte",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/SByte"
    ] );
};
NodeIdSettings.DAStaticTwoStateDiscreteItems = function()
{
    return( [
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/TwoStateDiscrete001",
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/TwoStateDiscrete002",
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/TwoStateDiscrete003",
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/TwoStateDiscrete004",
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/TwoStateDiscrete005"
    ] );
};
NodeIdSettings.DAStaticMultiStateDiscreteItems = function()
{
    return( [
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/MultiStateDiscrete001",
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/MultiStateDiscrete002",
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/MultiStateDiscrete003",
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/MultiStateDiscrete004",
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/MultiStateDiscrete005"
    ] );
};
NodeIdSettings.Paths = function()
{
    return( [ "/Server Test/NodeIds/Paths/Starting Node 1",
              "/Server Test/NodeIds/Paths/Unknown Path 1" ] );
}
NodeIdSettings.References = function()
{
    return( [ "/Server Test/NodeIds/References/Has 3 Forward References 1",
              "/Server Test/NodeIds/References/Has 3 Forward References 2",
              "/Server Test/NodeIds/References/Has 3 Forward References 3",
              "/Server Test/NodeIds/References/Has 3 Forward References 4",
              "/Server Test/NodeIds/References/Has 3 Forward References 5",
              "/Server Test/NodeIds/References/Has Inverse And Forward References",
              "/Server Test/NodeIds/References/Has References With Different Parent Types",
              "/Server Test/NodeIds/References/Has 3 Inverse References 1"
            ] );
}
NodeIdSettings.getNodeWithReferencesInBothDirections = function()
{
    return "/Server Test/NodeIds/References/Has Inverse And Forward References";
};

// Returns an array of settings for Unknown NodeIds
NodeIdSettings.UnknownNodeIds = function()
{
    return( [
        "/Advanced/NodeIds/Invalid/UnknownNodeId1",
        "/Advanced/NodeIds/Invalid/UnknownNodeId2",
        "/Advanced/NodeIds/Invalid/UnknownNodeId3",
        "/Advanced/NodeIds/Invalid/UnknownNodeId4" ] );
}
// Returns an array of settings for Invalid NodeIs
NodeIdSettings.InvalidNodeIds = function()
{
    return( [
        "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId1",
        "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId2" ] );
}

NodeIdSettings.NodeClasses = function()
{
    return( [ "/Server Test/NodeIds/NodeClasses/HasObject", "/Server Test/NodeIds/NodeClasses/HasVariable",
        "/Server Test/NodeIds/NodeClasses/HasMethod", "/Server Test/NodeIds/NodeClasses/HasObjectType", 
        "/Server Test/NodeIds/NodeClasses/HasVariableType", "/Server Test/NodeIds/NodeClasses/HasReferenceType",
        "/Server Test/NodeIds/NodeClasses/HasDataType" ] );
}

NodeIdSettings.AdvancedInvalid = function()
{
    return( [
        "/Advanced/NodeIds/Invalid/UnknownNodeId1", "/Advanced/NodeIds/Invalid/UnknownNodeId2",
        "/Advanced/NodeIds/Invalid/UnknownNodeId3", "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId1",
        "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId2"
        ] );
}

// Returns an array of NodeIds that have been safely generated from the 
// Static node settings
// Parameters:
//     - maxNumberNeeded (optional) = reduces the array size to meet he need
NodeIdSettings.GetScalarStaticNodeIds = function( maxNumberNeeded )
{
    return( this.getMaxNoNodeIds( this.ScalarStatic(), maxNumberNeeded ) );
};

/*  Returns an array of NodeIds that have been safely generated from the
    static Array node settings.
    Parameters:
        - maxNumberNeeded (optional) = reduces the array size to meet he need */
NodeIdSettings.GetScalarStaticArrayNodeIds = function( maxNumberNeeded )
{
    return( this.getMaxNoNodeIds( this.ArraysStatic(), maxNumberNeeded ) );
};

/*  Returns an array of NodeIds that have been safely generated from the
    static Static/DA Profile node settings.
    Parameters:
        - maxNumberNeeded (optional) = reduces the array size to meet he need */
NodeIdSettings.GetDAAnalogStaticNodeIds = function( maxNumberNeeded )
{
    return( this.getMaxNoNodeIds( this.DAStaticAnalog(), maxNumberNeeded ) );
};

// Intended for internal use only, not to be called directly by scripts.
NodeIdSettings.getMaxNoNodeIds = function( nodeIdsFunctionPointer, maxNumberNeeded )
{
    if( maxNumberNeeded === undefined || maxNumberNeeded === null )
    {
        return( this.getNodes( nodeIdsFunctionPointer, true ) );
    }
    else
    {
        var nodes = this.getNodes( nodeIdsFunctionPointer, true );
        while( nodes.length > maxNumberNeeded )
        {
            nodes.pop(); // removes the first item from the array
        }
        return( nodes );
    }
};

// Returns a scalar NodeId (of one of the preferred datatypes if provided).
// preferredDatatypes is an array of BuiltInType enums, or an array or string
// containing one or more of the following characters:
// "i": Any signed integer type: Int16, Int32, Int64
// "u": Any unsigned integer type: UInt16, UInt32, UInt64
// "d": Any decimal type: Float, Double
// E.g.: NodeIdSettings.GetAScalarStaticNodeIdSetting( "iu" );
// E.g.: NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Byte, BuiltInType.SByte ] );
// E.g.: NodeIdSettings.GetAScalarStaticNodeIdSetting( [ "i", BuiltInType.SByte, "u", BuiltInType.Byte ] );
NodeIdSettings.GetAScalarNodeIdSetting = function( settings, preferredDatatypesIn )
{
    var nodeIds = []; // array of nodeIds indexed by the BuiltInType enum
    var nodeIdSettings = []; // array of nodeId settings indexed by the BuiltInType enum
    var foundNodeIdSetting;
    var i;
    for( i = 0; i < settings.length; i++ )
    {
        var settingValue = readSetting( settings[i] );
        if( settingValue === undefined || settingValue === null || settingValue === " " )
        {
            continue;
        }
        var nodeId = UaNodeId.fromString( settingValue.toString() );
        var datatype = NodeIdSettings.guessType( settings[i] );
        if( datatype !== "" )
        {
            nodeIds[datatype] = nodeId;
            nodeIdSettings[datatype] = settings[i];
        }
    }
    if( preferredDatatypesIn !== undefined )
    {
        var preferredDatatypes = []; // the array we'll build with the preferredDatatype BuiltInType enum values

        // expand shorthand in preferredDatatypes
        for( i = 0; i < preferredDatatypesIn.length; i++ )
        {
            switch( preferredDatatypesIn[i] )
            {
                case "i":
                    preferredDatatypes = preferredDatatypes.concat( [ BuiltInType.Int16, BuiltInType.Int32, BuiltInType.Int64 ] );
                    break;
                case "u":
                    preferredDatatypes = preferredDatatypes.concat( [ BuiltInType.UInt16, BuiltInType.UInt32, BuiltInType.UInt64 ] );
                    break;
                case "d":
                    preferredDatatypes = preferredDatatypes.concat( [ BuiltInType.Float, BuiltInType.Double ] );
                    break;
                default:
                    preferredDatatypes.push( preferredDatatypesIn[i] );
            }
        }

        // try to return a preffered type
        for( i = 0; i < preferredDatatypes.length; i++ )
        {
            if( ( nodeIds[preferredDatatypes[i]] !== null ) && ( nodeIds[preferredDatatypes[i]] !== undefined ) )
            {
                foundNodeIdSetting = new NodeIdSetting();
                foundNodeIdSetting.name = nodeIdSettings[preferredDatatypes[i]];
                foundNodeIdSetting.id = nodeIds[preferredDatatypes[i]];
                foundNodeIdSetting.datatype = preferredDatatypes[i];
                return foundNodeIdSetting;
            }
        }
    }
    // couldn't return preferred type, so just return the first
    for( i = 0; i < nodeIds.length; i++ )
    {
        if( ( nodeIds[i] !== null ) && ( nodeIds[i] !== undefined ) )
        {
            foundNodeIdSetting = new NodeIdSetting();
            foundNodeIdSetting.name = nodeIdSettings[i];
            foundNodeIdSetting.id = nodeIds[i];
            foundNodeIdSetting.datatype = i;
            return foundNodeIdSetting;
        }
    }
    return null; // no settings set
};



// Returns a scalar, static NodeId (of one of the preferred datatypes if provided).
// preferredDatatypes is an array of BuiltInType enums, or an array or string
// containing one or more of the following characters:
// "i": Any signed integer type: Int16, Int32, Int64
// "u": Any unsigned integer type: UInt16, UInt32, UInt64
// "d": Any decimal type: Float, Double
// E.g.: NodeIdSettings.GetAScalarStaticNodeIdSetting( "iu" );
// E.g.: NodeIdSettings.GetAScalarStaticNodeIdSetting( [ BuiltInType.Byte, BuiltInType.SByte ] );
// E.g.: NodeIdSettings.GetAScalarStaticNodeIdSetting( [ "i", BuiltInType.SByte, "u", BuiltInType.Byte ] );
NodeIdSettings.GetAScalarStaticNodeIdSetting = function( preferredDatatypesIn )
{
    return this.GetAScalarNodeIdSetting( this.ScalarStaticAll(), preferredDatatypesIn );
};

NodeIdSettings.GetAStaticAnalogNodeIdSetting = function()
{
    var nodeId = UaNodeId.fromString( readSetting( this.DAStaticAnalog()[0] ).toString() );
    if( ( nodeId !== null ) && ( nodeId !== undefined ) )
    {
        var foundNodeIdSetting = new NodeIdSetting();
        foundNodeIdSetting.name = this.DAStaticAnalog()[0];
        foundNodeIdSetting.id = nodeId;
        return foundNodeIdSetting;
    }
    return null;
};

// Returns an array of NodeIds that have been safely generated from the 
// Static Array node settings
NodeIdSettings.GetArrayStaticNodeIds = function ()
{
    return( this.getNodes( this.ArraysStatic(), true ) );
};

NodeIdSettings.GetNodeIdsFromSettings = function ( settingNames, keepUnique )
{
    if( keepUnique !== undefined )
    {
        return( this.getNodes( settingNames ) );
    }
    else
    {
        return( this.getNodes( settingNames, keepUnique ) );
    }
};


// internal helper function used by GetScalarStaticNodeIds, 
// GetArrayStaticNodeIds.
NodeIdSettings.getNodes = function( settingsArray, keepUnique )
{
    var nodes = [];
    var nodeIdValue;
    if( settingsArray !== undefined )
    {
        // an array?
        if( settingsArray.length !== undefined )
        {
            for( var i=0; i<settingsArray.length; i++ )
            {
                if( keepUnique )
                {
                    AddNodeIdSettingToUniqueArray( nodes, settingsArray[i], settingsArray.length );
                }
                else
                {
                    nodeIdValue = UaNodeId.fromString( readSetting( settingsArray[i] ).toString() );
                    if( nodeIdValue !== undefined )
                    {
                        nodes.push( nodeIdValue );
                    }
                }
            }
        }
        else
        {
            addError( "NodeIdSettings.getNodes(): settingsArray does not have length" );
        }
    }
    return( nodes );
};

NodeIdSettings.getScalarStaticUniqueNodeIds = function( maxLength )
{
    var nodeIds = this.getNodes( this.ScalarStaticAll(), true );
    while( nodeIds.length > maxLength )
    {
        nodeIds.pop();
    }
    return nodeIds;
};

NodeIdSettings.GetMultipleVariableUniqueNodeIds = function( maxLength )
{
    var nodeSettingGetters = [ 
        this.ScalarStatic,
        this.ScalarDynamic,
        this.ScalarStatic1OneType ];
    
    var nodeIds = this.getNodes( nodeSettingGetters[0](), true );
    for( var i = 1; i < nodeSettingGetters.length && nodeIds.length < maxLength; i++ )
    {
        nodeIds = nodeIds.concat( this.getNodes( nodeSettingGetters[i], true ) );
    }
    while( nodeIds.length > maxLength )
    {
        nodeIds.pop();
    }
    return nodeIds;
};

NodeIdSettings.guessType = function( nodeSetting )
{
    return NodeIdSetting.guessType( nodeSetting );
};

NodeIdSettings.getAllNodeIdSettings = function()
{
    var allSettings = NodeIdSettings.ScalarStatic()
        .concat( NodeIdSettings.ScalarStatic1OneType() )
        .concat( NodeIdSettings.ArraysStatic() )
        .concat( NodeIdSettings.ArraysDynamic() )
        .concat( NodeIdSettings.ArraysDAAnalogType() )
        .concat( NodeIdSettings.DAAStaticDataItem() )
        .concat( NodeIdSettings.DAStaticAnalog() )
        .concat( NodeIdSettings.DAStaticTwoStateDiscreteItems() )
        .concat( NodeIdSettings.DAStaticMultiStateDiscreteItems() )
        .concat( NodeIdSettings.getNodeWithReferencesInBothDirections() )
        .concat( NodeIdSettings.UnknownNodeIds() )
        .concat( NodeIdSettings.InvalidNodeIds() )
        .concat( NodeIdSettings.Paths() );
    return( allSettings );
}


/*
// SOME TEST FUNCTIONS
include( "./library/Base/array.js" )
print( NodeIdSettings.ScalarStatic().toString() );
var nodes = NodeIdSettings.GetScalarStaticNodeIds();
addError( "" + NodeIdSettings.GetAScalarStaticNodeIdSetting( [BuiltInType.XmlElement] ) );

var setting = "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool";
var dataType = NodeIdSettings.guessType( setting );
print( "Data Type guess: " + BuiltInType.toString( dataType ) );
var srch = [ "i=2253", "ns=2;i=10387", "ns=2;i=10572", "ns=2;i=11024" ];
for( var i=0; i<srch.length; i++ )
{
    print( "Searching for NodeId '" + srch[i] + "'; found: " + NodeIdSettings.findSettingFromNodeId( srch[i] ) );
}
*/