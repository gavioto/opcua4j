// NodeIdSetting class to store CTT NodeId setting info.

/*globals addError, addWarningOnce, BuiltInType, include, readSetting, Setting, UaNodeId
*/

include( "./library/Base/SettingsUtilities/Setting.js" );
include( "./library/Base/warnOnce.js" );

function NodeIdSetting()
{
    this.id = null;
    this.datatype = null;
}
NodeIdSetting.prototype = new Setting();


// Read a given NodeId setting, storing info
NodeIdSetting.prototype.read = function( settingName )
{
    Setting.prototype.read.call( this, settingName );
    if( this.value !== "" )  // ignore empty settings; catch them in readOptional and readRequired
    {
        this.id = UaNodeId.fromString( this.value );
        this.guessType();
        
        if( this.id === null )
        {
            addError( "Setting <" + this.name + "> is not a valid NodeId string: " + this.value );
        }
    }        
};


// Read an optional NodeId setting.
NodeIdSetting.prototype.readOptional = function( settingName )
{
    this.read( settingName );
    if( this.value === "" )
    {
        addWarning( "Setting not configured: '" + settingName + "'" );
    }
};


// Read a required NodeId setting.
NodeIdSetting.prototype.readRequired = function( settingName )
{
    this.read( settingName );
    if( this.value === "" )
    {
        addWarning( "Setting not configured: '" + settingName + "'" );
    }
};


// Guess the DataType of the NodeId represented by this setting.
NodeIdSetting.prototype.guessType = function()
{
    this.datatype = NodeIdSetting.guessType( this.name );
};


// Static read: returns a new NodeIdSetting instance
NodeIdSetting.read = function( settingName )
{
    var nodeIdSetting = new NodeIdSetting();
    nodeIdSetting.read( settingName );
    return nodeIdSetting;
};


// Static read of an optional NodeId setting. Returns a new NodeIdSetting instance.
NodeIdSetting.readOptional = function( settingName )
{
    var nodeIdSetting = new NodeIdSetting();
    nodeIdSetting.readOptional( settingName );
    return nodeIdSetting;
};


// Static read of a required NodeId setting. Returns a new NodeIdSetting instance.
NodeIdSetting.readRequired = function( settingName )
{
    var nodeIdSetting = new NodeIdSetting();
    nodeIdSetting.readRequired( settingName );
    return nodeIdSetting;
};


NodeIdSetting.guessType = function( nodeSetting )
{
    // look for a data type string in the nodeSetting's parent/Value Data Type
    if( nodeSetting === undefined || nodeSetting === null )
    {
        return( BuiltInType.Null );
    }
    var dataTypeString;
    var parentSetting = nodeSetting.match( /\/.*\/(.*\/)/ );
    if( parentSetting[1].search( /(^| )Set( |$)/ ) < 0 )
    {
        // no such setting, so just use the setting name as the data type string
        dataTypeString = nodeSetting.match( /\/.*\/(.*?)(EURange|EngineeringUnits)?$/ )[1];
    }
    else
    {
        dataTypeString = readSetting( parentSetting[0] + "Value Data Type" ).toString();
    }
    
    switch( dataTypeString )
    {
        case "Bool":
            return BuiltInType.Boolean;
        case "Byte":
            return BuiltInType.Byte;
        case "ByteString":
            return BuiltInType.ByteString;
        case "DateTime":
            return BuiltInType.DateTime;
        case "Double":
            return BuiltInType.Double;
        case "Float":
            return BuiltInType.Float;
        case "Guid":
            return BuiltInType.Guid;
        case "Int16":
            return BuiltInType.Int16;
        case "Int32":
            return BuiltInType.Int32;
        case "Int64":
            return BuiltInType.Int64;
        case "String":
            return BuiltInType.String;
        case "SByte":
            return BuiltInType.SByte;
        case "UInt16":
            return BuiltInType.UInt16;
        case "UInt32":
            return BuiltInType.UInt32;
        case "UInt64":
            return BuiltInType.UInt64;
        case "XmlElement":
            return BuiltInType.XmlElement;
   }
   return "";
};


/* tests
NodeIdSetting.prototype.print = function()
{
    print( this.name );
    print( this.value );
    print( "" + this.id );
    print( "" + BuiltInType.toString( this.datatype ) );
}
// good NodeId setting
var n = NodeIdSetting.read( "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16" );
n.print()
n = NodeIdSetting.readOptional( "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16" );
n.print()
n = NodeIdSetting.readRequired( "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16" );
n.print()

// non-existent setting
n = NodeIdSetting.read( "/Server Test/NodeIds/Static/All Profiles/Scalar/Nada" );
n.print()
n = NodeIdSetting.readOptional( "/Server Test/NodeIds/Static/All Profiles/Scalar/Nada" );
n.print()
n = NodeIdSetting.readRequired( "/Server Test/NodeIds/Static/All Profiles/Scalar/Nada" );
n.print()

// blank NodeId setting
n = NodeIdSetting.read( "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid" );
n.print()
n = NodeIdSetting.readOptional( "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid" );
n.print()
n = NodeIdSetting.readRequired( "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid" );
n.print()

// setting is not a valid NodeId
n = NodeIdSetting.read( "/Test Tool/Stack Settings/Trace Level" );
n.print()
n = NodeIdSetting.readOptional( "/Test Tool/Stack Settings/Trace Level" );
n.print()
n = NodeIdSetting.readRequired( "/Test Tool/Stack Settings/Trace Level" );
n.print()
*/