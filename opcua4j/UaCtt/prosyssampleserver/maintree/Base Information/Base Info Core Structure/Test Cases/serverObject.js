/*  Test 1 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Tests the SERVER object in the Servers address space.

    Revision History
        24-May-2011 NP: Initial version.
        25-Jul-2011 NP: Fixed ServerRedundancy "RedundancySupport"; prev. assumption was Abstract and not usable.
*/

include( "./library/Information/_Base/InformationModelObjectHelper.js" );

/*  This function is responsible for validating a Node of a specific type and the validation
    that every entity of the Node is correct, per the UA Specifications.

    Object types defined here:
    --------------------------------------------------------------------------
        Object type                  | My object name for it
    ---------------------------------|----------------------------------------
        ServerType                   | IM_Server()
        ServerCapabilitiesType       | IM_ServerCapabilitiesType
        ServerStatusType             | IM_ServerStatusType
        BuildInfoType                | IM_BuildInfoType
        ServerRedundancyType         | IM_ServerRedundancyType
        TransparentRedundancyType    | IM_TransparentRedundancyType
        NonTransparentRedundancyType | IM_NonTransparentRedundancyType
    --------------------------------------------------------------------------

    Revision History:
        12-Nov-2010 NP: Initial version.
        
NOTE: Arrays are defined in the InformationModelObjectHelper.js script.
*/

IM_ServerType.prototype = new IM();
IM_ServerType.constructor = IM_ServerType;
function IM_ServerType()
{
    this.Name = "ServerType";
    this.References = [
        new UaRefDescHelper( Identifier.HasProperty,  "ServerArray",    NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ), BuiltInType.String,    ARRAY,    REQUIRED ),
        new UaRefDescHelper( Identifier.HasProperty,  "NamespaceArray", NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ), BuiltInType.String,    ARRAY,    REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "ServerStatus",   NodeClass.Variable, new UaExpandedNIDHelper( Identifier.ServerStatusType ), undefined,         NOTARRAY, REQUIRED, new IM_ServerStatusType() ),
        new UaRefDescHelper( Identifier.HasProperty,  "ServiceLevel",   NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ), BuiltInType.Byte,      NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasProperty,  "Auditing",       NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ), BuiltInType.Boolean,   NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "ServerCapabilities", NodeClass.Object, new UaExpandedNIDHelper( Identifier.ServerCapabilitiesType ), undefined, NOTARRAY, REQUIRED, new IM_ServerCapabilitiesType() ),
        new UaRefDescHelper( Identifier.HasComponent, "ServerDiagnostics",  NodeClass.Object, new UaExpandedNIDHelper( Identifier.ServerDiagnosticsType ),  undefined, NOTARRAY, REQUIRED, new IM_ServerDiagnosticsType() ),
        new UaRefDescHelper( Identifier.HasComponent, "VendorServerInfo",   NodeClass.Object, new UaExpandedNIDHelper( Identifier.VendorServerInfoType ),   undefined, NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "ServerRedundancy",   NodeClass.Object, new UaExpandedNIDHelper( Identifier.ServerRedundancyType ),   undefined, NOTARRAY, REQUIRED, new IM_ServerRedundancyType() )
        ];
}

IM_ServerCapabilitiesType.prototype = new IM();
IM_ServerCapabilitiesType.constructor = IM_ServerCapabilitiesType;
function IM_ServerCapabilitiesType()
{
    this.Name = "ServerCapabilitiesType";
    this.References = [
        new UaRefDescHelper( Identifier.HasProperty, "ServerProfileArray", NodeClass.Variable,     new UaExpandedNIDHelper( Identifier.PropertyType ), BuiltInType.String, ARRAY,  REQUIRED ),
        new UaRefDescHelper( Identifier.HasProperty, "LocaleIdArray",      NodeClass.Variable,     new UaExpandedNIDHelper( Identifier.PropertyType ), "LocaleId",         ARRAY,  REQUIRED ),
        new UaRefDescHelper( Identifier.HasProperty, "MinSupportedSampleRate", NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ), "Duration",         NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasProperty, "MaxBrowseContinuationPoints",  NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ), BuiltInType.UInt16, NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasProperty, "MaxQueryContinuationPoints",   NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ), BuiltInType.UInt16, NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasProperty, "MaxHistoryContinuationPoints", NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ), BuiltInType.UInt16, NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasProperty, "SoftwareCertificates",         NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ), "SoftwareCertificate", NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "ModellingRules",     NodeClass.Object, new UaExpandedNIDHelper( Identifier.FolderType ), undefined, NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "AggregateFunctions", NodeClass.Object, new UaExpandedNIDHelper( Identifier.FolderType ), undefined, NOTARRAY, REQUIRED )
        ];
}

IM_ServerStatusType.prototype = new IM();
IM_ServerStatusType.constructor = IM_ServerStatusType;
function IM_ServerStatusType()
{
    this.Name = "ServerStatusType";
    this.References = [
        new UaRefDescHelper( Identifier.HasComponent, "StartTime",   NodeClass.Variable, new UaExpandedNIDHelper( Identifier.BaseDataVariableType ),  BuiltInType.DateTime,      NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "CurrentTime", NodeClass.Variable, new UaExpandedNIDHelper( Identifier.BaseDataVariableType ),  BuiltInType.DateTime,      NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "State",       NodeClass.Variable, new UaExpandedNIDHelper( Identifier.ServerState ),           "ServerState",             NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "BuildInfo",   NodeClass.Variable, new UaExpandedNIDHelper( Identifier.BuildInfoType ),         "BuildInfo",               NOTARRAY, REQUIRED, new IM_BuildInfoType() ),
        new UaRefDescHelper( Identifier.HasComponent, "SecondsTillShutdown", NodeClass.Variable, new UaExpandedNIDHelper( Identifier.UInt32 ),        BuiltInType.UInt32,        NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "ShutdownReason",      NodeClass.Variable, new UaExpandedNIDHelper( Identifier.LocalizedText ), BuiltInType.LocalizedText, NOTARRAY, REQUIRED )
        ];
}

IM_ServerDiagnosticsType.prototype = new IM();
IM_ServerDiagnosticsType.constructor = IM_ServerDiagnosticsType;
function IM_ServerDiagnosticsType()
{
    this.Name = "ServerDiagnosticsType";
    this.References = [
        new UaRefDescHelper( Identifier.HasComponent, "ServerDiagnosticsSummary",         NodeClass.Variable, new UaExpandedNIDHelper( Identifier.ServerDiagnosticsSummaryType ),        "ServerDiagnosticsSummaryDataType",    NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "SamplingIntervalDiagnosticsArray", NodeClass.Variable, new UaExpandedNIDHelper( Identifier.SamplingIntervalDiagnosticsDataType ), "SamplingIntervalDiagnosticsArrayType", ARRAY, OPTIONAL ),
        new UaRefDescHelper( Identifier.HasComponent, "SubscriptionDiagnosticsArray",     NodeClass.Variable, new UaExpandedNIDHelper( Identifier.SubscriptionDiagnosticsDataType ),     "SubscriptionDiagnosticsArrayType",     ARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "SessionsDiagnosticsSummary",       NodeClass.Object,   new UaExpandedNIDHelper( Identifier.SessionsDiagnosticsSummaryType ),      undefined,           NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasProperty,  "EnabledFlag",                      NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ),                        BuiltInType.Boolean, NOTARRAY, REQUIRED )
        ];
}

IM_BuildInfoType.prototype = new IM();
IM_BuildInfoType.constructor = IM_BuildInfoType;
function IM_BuildInfoType()
{
    this.Name = "BuildInfoType";
    this.References = [
        new UaRefDescHelper( Identifier.HasComponent, "ProductUri",       NodeClass.Variable, new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), BuiltInType.String, NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "ManufacturerName", NodeClass.Variable, new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), BuiltInType.String, NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "ProductName",      NodeClass.Variable, new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), BuiltInType.String, NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "SoftwareVersion",  NodeClass.Variable, new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), BuiltInType.String, NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "BuildNumber",      NodeClass.Variable, new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), BuiltInType.String, NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasComponent, "BuildDate",        NodeClass.Variable, new UaExpandedNIDHelper( Identifier.BaseDataVariableType ), BuiltInType.String, NOTARRAY, REQUIRED )
        ];
}

IM_ServerRedundancyType.prototype = new IM();
IM_ServerRedundancyType.constructor = IM_ServerRedundancyType;
function IM_ServerRedundancyType()
{
    this.Name = "ServerRedundancyType";
    this.References = [
        new UaRefDescHelper( Identifier.HasProperty,       "RedundancySupport",            NodeClass.Variable,   new UaExpandedNIDHelper( Identifier.PropertyType ), "RedundancySupport", NOTARRAY, REQUIRED ),
        ];
}

IM_TransparentRedundancyType.prototype = new IM();
IM_TransparentRedundancyType.constructor = IM_TransparentRedundancyType;
function IM_TransparentRedundancyType()
{
    this.Name = "TransparentRedundancyType";
    this.References = [
        new UaRefDescHelper( Identifier.HasProperty, "CurrentServerId",      NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ), BuiltInType.String,        NOTARRAY, REQUIRED ),
        new UaRefDescHelper( Identifier.HasProperty, "RedundantServerArray", NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ), "RedundantServerDataType", ARRAY,  REQUIRED )
        ];
}

IM_NonTransparentRedundancyType.prototype = new IM();
IM_NonTransparentRedundancyType.constructor = IM_NonTransparentRedundancyType;
function IM_NonTransparentRedundancyType()
{
    this.Name = "NonTransparentRedundancyType";
    this.References = [
        new UaRefDescHelper( Identifier.HasProperty, "ServerUriArray", NodeClass.Variable, new UaExpandedNIDHelper( Identifier.PropertyType ), BuiltInType.String, ARRAY, REQUIRED )
        ];
}

function testServerObject()
{
    // variables and objects needed for the test
    var serverNode = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server ) )[0];    // NodeId of the SERVER object
    var serverObjectDefinition = new IM_ServerType(); // SERVER object definition (defined in CTT script)
    AssertTrue( NodeStructureIsCompliant( serverNode, serverObjectDefinition ), "Server object type is not compliant to the definition in OPC UA Specifications Part 5, clause '6.3.1 ServerType'." );
}

safelyInvoke( testServerObject );