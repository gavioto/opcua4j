/*globals include, readSetting, UaNodeId, addError, addWarningOnce */

include( "./library/Base/warnOnce.js" );

// Return a NodeId from an optional setting. If the setting is blank,
// log a warning and return null. If the setting is not blank but does
// not resolve to a non-null NodeId, log an error and return null.
function getNodeIdFromOptionalSetting( settingName )
{
    var nodeName = readSetting( settingName ).toString();
    var nodeId = null;
    if( nodeName !== "" )
    {
        nodeId = UaNodeId.fromString( nodeName );
        if( nodeId === null )
        {
            addError( "Setting " + settingName + " is not a NodeId string: " + nodeName );
            return null;
        }
    }
    else
    {
        addWarning( "Setting not configured: '" + settingName + "'." );
        return null;
    }
    return nodeId;
}


// Return a NodeId from a required setting. If the setting does
// not resolve to a non-null NodeId, log an error and return null.
function getNodeIdFromRequiredSetting( settingName )
{
    var nodeName = readSetting( settingName ).toString();
    var nodeId = null;
    if( nodeName !== "" )
    {
        nodeId = UaNodeId.fromString( nodeName );
        if( nodeId === null )
        {
            addError( "Setting " + settingName + " is not a NodeId string: " + nodeName );
            return null;
        }
    }
    else
    {
        addError( "Required setting '" + settingName + "' is not configured." );
        return null;
    }
    return nodeId;
}

// Returns the value of a Setting. If the setting's value is null, empty, or not
// defined, then the specified default value is returned instead.
function getSettingValueOrDefaultValue( settingName, defaultValue )
{
    if( settingName === undefined || settingName === null || settingName === "" )
    {
        return( defaultValue );
    }

    var settingValue = readSetting( settingName );
    if( settingValue === undefined || settingValue === null  || settingValue.toString() === "undefined")
    {
        settingValue = defaultValue;
    }
    return( settingValue );
}