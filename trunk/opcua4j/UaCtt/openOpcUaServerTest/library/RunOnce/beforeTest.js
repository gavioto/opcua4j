/*  SettingsValidation.js
    This script will read the Settings configured with the COMPLIANCE project, which is used for compliance testing
    OPC UA Servers.

    Revision History:
        15-Mar-2010 NP: Initial Version.
*/

/*globals addError, addWarning, AssertEqual, AssertGreaterThan, AssertInRange, 
  AssertIsNumeric, AssertOptionalSetting, AssertSettingGood, include, print, readSetting
*/

include( "./library/Base/SettingsUtilities/validate_setting.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/warnOnce.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );


// --- Constants used in this script ---
const ACCEPTABLE_DEFAULT_PUBLISHINGINTERVAL_MSEC_MIN = 200;
const ACCEPTABLE_DEFAULT_PUBLISHINGINTERVAL_MSEC_MAX = 10000;
const MINIMUM_NODEID_SCALAR_NEEDED = 5;
const MINIMUM_NODEID_SCALARSET1_NEEDED = 3;

function checkSettingsConfigured( settings, sectionName, minimumRequired )
{
    var numFound = 0;
    print( "\n----------------------------------------------------------------------------------------------------\nChecking '" + sectionName + "'" );
    for( var i=0; i<settings.length; i++ )
    {
        if( AssertSettingGood( settings[i] ) )
        {
            numFound++;
        }
    }
    print( "\t... checking complete." );
    return( numFound );
}
function checkOptionalSettingsConfigured( settings, sectionName, minimumRequired )
{
    var numFound = 0;
    print( "\n----------------------------------------------------------------------------------------------------\nChecking optional settings in '" + sectionName + "'." );
    for( var i=0; i<settings.length; i++ )
    {
        if( AssertOptionalSetting( settings[i] ) )
        {
            numFound++;
        }
    }
    print( "\t... checking complete. ");
}
function checkOptionalDataTypeSettingConfigured( settings, sectionName, minimumRequired )
{
    var numFound = 0;
    print( "\n----------------------------------------------------------------------------------------------------\nChecking optional settings in '" + sectionName + "'." );
    for( var i=0; i<settings.length; i++ )
    {
        if( AssertOptionalDataTypeSetting( settings[i] ) )
        {
            numFound++;
        }
    }
    print( "\t... checking complete. ");
}
function checkSettingsAreNumeric( settings )
{
    for( var i=0; i<settings.length; i++ )
    {
        var settingValue = readSetting( settings[i] ).toString();
        AssertIsNumeric( settingValue, "Setting '" + settings[i] + "' is not numeric!" );
    }
}
// Server Test category:
//    NodeIds > All Profiles
function serverTest()
{
    var settings = [ "/Server Test/Server URL", "/Server Test/Discovery URL",
        "/Server Test/Default Subscription Publish Interval", "/Server Test/Fastest Publish Interval Supported",
        "/Server Test/Max Supported MonitoredItems" ];
    print( "Checking Server Test settings..." );
    var allGood = true;
    var i;
    var settingValue;
    for( i=0; i<settings.length; i++ )
    {
        if( !AssertSettingGood( settings[i] ) )
        {
            allGood = false;
        }
    }
    if( !allGood )
    {
        print( "Prematurely leaving checkServerTestSettings. Required settings are not configured." );
        return;
    }
    // check endpoints start with "opc.tcp://"
    var quickStartFound = false;
    for( i=0; i<2; i++ )
    {
        settingValue = readSetting( settings[i] ).toString();
        AssertEqual( 0, settingValue.indexOf( "opc.tcp://" ),
            "Endpoints URLs should start with 'opc.tcp://'. Check setting '" + settings[i] + "'. Current value is: '" + settingValue + "'." );
        // see if endpoint is for the OPC Foundation REFERENCE SERVER and then remind the user
        // to install it, just in case.
        if( settingValue.indexOf("/Quickstarts/" ) > 0 )
        {
            if( quickStartFound ) continue;
            addLog( "Project is currently configured for testing an OPC Foundation QUICKSTART application." );
            addLog( "Download QuickStart applications (recommended) from the OPC Foundation WEBSITE at:" );
            addLog( "http://www.opcfoundation.org/ua/quickstart" );
            quickStartFound = true;
        }
    }
    // check numeric settings are actually numeric!
    for( i=2; i<=3; i++ )
    {
        settingValue = readSetting( settings[i] ).toString();
        AssertIsNumeric( settingValue, "The setting '" + settings[i] + "' needs to be numeric!" );
    }
    // check publishInterval is reasonable
    var defaultPublishInterval = parseInt( readSetting( settings[2] ).toString() );
    AssertInRange( ACCEPTABLE_DEFAULT_PUBLISHINGINTERVAL_MSEC_MIN, ACCEPTABLE_DEFAULT_PUBLISHINGINTERVAL_MSEC_MAX, defaultPublishInterval, "Default Publishing Interval MAY be set to a value that is outside of the recommended test values of '" + ACCEPTABLE_DEFAULT_PUBLISHINGINTERVAL_MSEC_MIN + "' and '" + ACCEPTABLE_DEFAULT_PUBLISHINGINTERVAL_MSEC_MAX + "'.", true );
    var fastestPublishInterval = parseInt( readSetting( settings[3] ).toString() );
    AssertGreaterThan( 0, fastestPublishInterval, "Fastest Publishing interval supported may be too fast." );
    if( fastestPublishInterval > defaultPublishInterval )
    {
        addError( "Fastest Publishing Interval should be the same speed, or faster than the default... but not slower!" );
    }
    // check the diags
    var checkedValue = readSetting( "/Server Test/DiagnosticInfo Response Testing" ).toString();
    if( checkedValue === 0 || checkedValue === "0" )
    {
        addWarning( "No diagnosticsInfo checking will be done on Response headers." );
    }
    // clock-sync?
    checkedValue = readSetting( "/Server Test/Time Synchronization Checking" ).toString();
    if( checkedValue === 0 || checkedValue === "0" )
    {
        addWarning( "Clock Synchronization checking has been disabled. The time-difference between the CTT and the Server will not be detected which could otherwise help detect inefficienes with timing." );
    }
    print( "\tServer Test settings verified." );
}
function serverTestNodeIdsStaticAllProfilesScalar()
{
    var settings = NodeIdSettings.ScalarStatic();
    AssertGreaterThan( MINIMUM_NODEID_SCALAR_NEEDED, 
        checkOptionalDataTypeSettingConfigured( settings, "/Server Test/NodeIds/Static/All Profiles/Scalar", MINIMUM_NODEID_SCALAR_NEEDED ),
            "Need at least " + MINIMUM_NODEID_SCALAR_NEEDED + " Static Scalar Nodes configured for testing." );
}
function serverTestNodeIdsStaticAllProfilesArrays()
{
    var settings = NodeIdSettings.ArraysStatic();
    checkOptionalSettingsConfigured( settings, "/Server Test/NodeIds/Static/All Profiles/Arrays" );
}

//    NodeIds > DA Profile
function serverTestNodeIdsStaticAllProfilesDADataItem()
{
    var settings = [ "/Server Test/NodeIds/Static/DA Profile/DataItem/Byte", "/Server Test/NodeIds/Static/DA Profile/DataItem/Double",
        "/Server Test/NodeIds/Static/DA Profile/DataItem/Float",  "/Server Test/NodeIds/Static/DA Profile/DataItem/Int16", 
        "/Server Test/NodeIds/Static/DA Profile/DataItem/UInt16", "/Server Test/NodeIds/Static/DA Profile/DataItem/Int32", 
        "/Server Test/NodeIds/Static/DA Profile/DataItem/UInt32", "/Server Test/NodeIds/Static/DA Profile/DataItem/Int64", 
        "/Server Test/NodeIds/Static/DA Profile/DataItem/UInt64", "/Server Test/NodeIds/Static/DA Profile/DataItem/SByte", 
        "/Server Test/NodeIds/Static/DA Profile/DataItem/String", "/Server Test/NodeIds/Static/DA Profile/DataItem/DateTime" ];
    checkOptionalDataTypeSettingConfigured( settings, "/Server Test/NodeIds/Static/DA Profile/DataItem" );
}
function serverTestNodeIdsStaticAllProfilesDAAnalogType()
{
    var settings = [ "/Server Test/NodeIds/Static/DA Profile/AnalogType/Double",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/Float",  "/Server Test/NodeIds/Static/DA Profile/AnalogType/Int16", 
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/UInt16", "/Server Test/NodeIds/Static/DA Profile/AnalogType/Int32", 
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/UInt32", "/Server Test/NodeIds/Static/DA Profile/AnalogType/Int64", 
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/UInt64", "/Server Test/NodeIds/Static/DA Profile/AnalogType/Byte", 
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/SByte",  "/Server Test/NodeIds/Static/DA Profile/AnalogType/NodeIdWithEngineeringUnits",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType/NodeIdWithInstrumentRange" ];
    checkOptionalDataTypeSettingConfigured( settings, "/Server Test/NodeIds/Static/DA Profile/AnalogType" );
}
function serverTestNodeIdsStaticAllProfilesDADiscreteType()
{
    var settings = [ "/Server Test/NodeIds/Static/DA Profile/DiscreteType/MultiStateDiscrete001", "/Server Test/NodeIds/Static/DA Profile/DiscreteType/MultiStateDiscrete002", 
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/MultiStateDiscrete003", "/Server Test/NodeIds/Static/DA Profile/DiscreteType/MultiStateDiscrete004", 
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/MultiStateDiscrete005", "/Server Test/NodeIds/Static/DA Profile/DiscreteType/TwoStateDiscrete001",
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/TwoStateDiscrete002",   "/Server Test/NodeIds/Static/DA Profile/DiscreteType/TwoStateDiscrete003", 
        "/Server Test/NodeIds/Static/DA Profile/DiscreteType/TwoStateDiscrete004",   "/Server Test/NodeIds/Static/DA Profile/DiscreteType/TwoStateDiscrete005" ];
    checkOptionalSettingsConfigured( settings, "/Server Test/NodeIds/Static/DA Profile/DiscreteType" );
}
function serverTestNodeIdsStaticAllProfilesDADeadband()
{
    var settings = [ "/Server Test/NodeIds/Static/DA Profile/AnalogType Arrays/Int16", "/Server Test/NodeIds/Static/DA Profile/AnalogType Arrays/Int32",
        "/Server Test/NodeIds/Static/DA Profile/AnalogType Arrays/UInt16", "/Server Test/NodeIds/Static/DA Profile/AnalogType Arrays/UInt32", 
        "/Server Test/NodeIds/Static/DA Profile/AnalogType Arrays/Float", "/Server Test/NodeIds/Static/DA Profile/AnalogType Arrays/Double" ];
    checkOptionalSettingsConfigured( settings, "/Server Test/NodeIds/Static/DA Profile/Deadband" );
}
// NODEIDs, References 
function serverTestNodeIdsReferences()
{
    var settings = [ "/Server Test/NodeIds/References/Has 3 Forward References 1",
        "/Server Test/NodeIds/References/Has 3 Forward References 2", "/Server Test/NodeIds/References/Has 3 Forward References 3",
        "/Server Test/NodeIds/References/Has 3 Forward References 4", "/Server Test/NodeIds/References/Has 3 Forward References 5", 
        "/Server Test/NodeIds/References/Has Inverse And Forward References", 
        "/Server Test/NodeIds/References/Has References With Different Parent Types", 
        "/Server Test/NodeIds/References/Has 3 Inverse References 1" ];
    checkSettingsConfigured( settings, "/Server Test/NodeIds/References" );
}
function serverTestNodeIdsPaths()
{
    var settings = NodeIdSettings.Paths();
    checkSettingsConfigured( settings, "/Server Test/NodeIds/Paths" );
}
function serverTestNodeIdsNodeClasses()
{
    var settings = [ "/Server Test/NodeIds/NodeClasses/Variable", "/Server Test/NodeIds/NodeClasses/Object",
        "/Server Test/NodeIds/NodeClasses/Method", "/Server Test/NodeIds/NodeClasses/ObjectType",
        "/Server Test/NodeIds/NodeClasses/VariableType", "/Server Test/NodeIds/NodeClasses/ReferenceType", 
        "/Server Test/NodeIds/NodeClasses/DataType", "/Server Test/NodeIds/NodeClasses/View",
        "/Server Test/NodeIds/NodeClasses/HasObject", "/Server Test/NodeIds/NodeClasses/HasVariable",
        "/Server Test/NodeIds/NodeClasses/HasMethod", "/Server Test/NodeIds/NodeClasses/HasObjectType",
        "/Server Test/NodeIds/NodeClasses/HasVariableType", "/Server Test/NodeIds/NodeClasses/HasReferenceType",
        "/Server Test/NodeIds/NodeClasses/HasDataType", "/Server Test/NodeIds/NodeClasses/HasView" ];
    checkSettingsConfigured( settings, "/Server Test/NodeIds/NodeClasses" );
}
// Remaining sub-categories
function serverTestSession()
{
    var settings = [ "/Server Test/Session/UserAuthenticationPolicy",
        "/Server Test/Session/LoginNameGranted1",
        "/Server Test/Session/LoginPasswordGranted1",
        "/Server Test/Session/LoginNameGranted2",
        "/Server Test/Session/LoginPasswordGranted2",
        "/Server Test/Session/LoginNameAccessDenied",
        "/Server Test/Session/LoginPasswordAccessDenied" ];

    var identitySetting = getSettingValueOrDefaultValue( settings[0], -1 );
    if( AssertInRange( 0, 2, identitySetting, "Expect setting '" + settings[0] + "' to be in the range of 0-2." ) )
    {
        if( identitySetting == 0 )
        {
            addLog( "Using Anonymous for channel/session authentication." );
        }
        else if( identitySetting == 1 )
        {
            if( getSettingValueOrDefaultValue( settings[1], "" ) == "" )
            {
                addWarning( "Setting '" + settings[1] + "' is empty. No secure channel/session testing can be performed using login credentials." );
            }
            if( getSettingValueOrDefaultValue( settings[2], "" ) == "" )
            {
                addWarning( "Setting '" + settings[2] + "' is empty. A password should be used for checking user-credentials for secure channel/session." );
            }
            if( getSettingValueOrDefaultValue( settings[3], "" ) == "" )
            {
                addWarning( "Setting '" + settings[3] + "' is empty. No secure channel/session testing can be performed using login credentials." );
            }
            if( getSettingValueOrDefaultValue( settings[4], "" ) == "" )
            {
                addWarning( "Setting '" + settings[4] + "' is empty. A password should be used for checking user-credentials for secure channel/session." );
            }
            if( getSettingValueOrDefaultValue( settings[5], "" ) == "" )
            {
                addWarning( "Setting '" + settings[5] + "' is empty. No secure channel/session testing can be performed using login credentials." );
            }
            if( getSettingValueOrDefaultValue( settings[6], "" ) == "" )
            {
                addWarning( "Setting '" + settings[6] + "' is empty. A password should be used for checking user-credentials for secure channel/session." );
            }
        }
    }
    print( "Server Test > Session; complete." );
}

// Test Tools Category
function testToolStackSettings()
{
    // check thread timeout only
    checkSettingsConfigured( ["/Test Tool/Stack Settings/Thread Timeout"], "/Test Tool/Stack Settings" );
}
function testToolScriptEngine()
{
    var result = getSettingValueOrDefaultValue( "/Test Tool/Script Engine/Use Async API", false );
    if( result == 2 )
    {
        addLog( "Using ASYNC API" );
    }
    else
    {
        addLog( "Using SYNC API" );
    }
}
function testToolEditor()
{
}

// Ua Settings category
function uaSettingsCertificates()
{
    var settings = [ "/Ua Settings/Certificates/CertificateTrustListLocation",
        "/Ua Settings/Certificates/CertificateRevocationListLocation", "/Ua Settings/Certificates/ClientCertificate",
        "/Ua Settings/Certificates/ClientPrivateKey", "/Ua Settings/Certificates/ServerCertificate" ];
    checkSettingsConfigured( settings, "/Ua Settings/Certificates/" );
}
function uaSettingsCertificatesExpired()
{
    var settings = [ "/Ua Settings/Certificates/ExpiredClientCertificate",
        "/Ua Settings/Certificates/ExpiredClientPrivateKey" ];
    checkSettingsConfigured( settings, "/Ua Settings/Certificates/" );
}
function uaSettingsCertificatesIncorrectlySigned()
{
    var settings = [ "/Ua Settings/Certificates/IncorrectlySignedClientCertificate",
        "/Ua Settings/Certificates/IncorrectlySignedClientPrivateKey" ];
    checkSettingsConfigured( settings, "/Ua Settings/Certificates/" );
}
function uaSettingsSecureChannel()
{
    var settings = [ "/Ua Settings/Secure Channel/MessageSecurityMode", "/Ua Settings/Secure Channel/NetworkTimeout",
        "/Ua Settings/Secure Channel/RequestedLifetime", "/Ua Settings/Secure Channel/RequestedSecurityPolicyUri" ];
    checkSettingsConfigured( settings, "/Ua Settings/Secure Channel/" );
    // check the numerics are actually numerics
    checkSettingsAreNumeric( [settings[1], settings[2]] );
}
function uaSettingsSession()
{
    var settings = [ "/Ua Settings/Session/DefaultTimeoutHint", "/Ua Settings/Session/RequestedSessionTimeout",
        "/Ua Settings/Session/MaxResponseMessageSize" ];
    checkSettingsConfigured( settings, "/Ua Settings/Session/" );
    // check all settings (numeric) are actually numerics
    checkSettingsAreNumeric( settings );
}
function checkAdvancedInvalidNodeIds()
{
    var settings = [ "/Advanced/NodeIds/Invalid/InvalidNodeId1", "/Advanced/NodeIds/Invalid/InvalidNodeId2",
        "/Advanced/NodeIds/Invalid/UnknownNodeId1", "/Advanced/NodeIds/Invalid/UnknownNodeId2", 
        "/Advanced/NodeIds/Invalid/UnknownNodeId3", "/Advanced/NodeIds/Invalid/UnknownNodeId4",
        "/Advanced/NodeIds/Invalid/UnknownNodeId5", "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId1", 
        "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId2" ]; //, "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId3",
        //"/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId4" ];
    checkSettingsConfigured( settings, "/Advanced/NodeIds/Invalid/" );
}


// SERVER TEST Category
serverTest();
//nodeIds STATIC (all profiles)
serverTestNodeIdsStaticAllProfilesScalar();
serverTestNodeIdsStaticAllProfilesArrays();
// nodeIds STATIC (da profile)
serverTestNodeIdsStaticAllProfilesDADataItem();
serverTestNodeIdsStaticAllProfilesDAAnalogType();
serverTestNodeIdsStaticAllProfilesDADiscreteType();
serverTestNodeIdsStaticAllProfilesDADeadband();
// nodeIds classes
serverTestNodeIdsReferences();
serverTestNodeIdsPaths();
serverTestNodeIdsNodeClasses();
// remaining categories
serverTestSession();

// TEST TOOL Category
testToolStackSettings();
testToolScriptEngine();
testToolEditor();

// UA SETTINGS Category
uaSettingsCertificates();
uaSettingsCertificatesExpired();
uaSettingsCertificatesIncorrectlySigned();
uaSettingsSecureChannel();
uaSettingsSession();

// ADVANCED Category
checkAdvancedInvalidNodeIds();