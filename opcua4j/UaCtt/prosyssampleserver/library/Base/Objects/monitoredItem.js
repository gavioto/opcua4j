/*globals addError, addLog, addWarningOnce, ArrayToFormattedString, Attribute, BuiltInType,
  include, MonitoringMode, NodeIdSettings, print, Read, readSetting, TimestampsToReturn,
  UaDataValue, UaNodeId, UaQualifiedName
*/

include( "./library/Base/warnOnce.js" );

var __clientHandle = null;
if( __clientHandle === null )
{
    __clientHandle = 0;
}
/* Object holding all parameters needed for a monitored item

    Methods:
        toString                  = function()
        SafelySetValueTypeUnknown = function( newValue, sessionObject )
        SafelySetValueTypeKnown   = function( newValue, dataType )
        fromNodeIds               = function( Nodes, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn )
        toNodeIds                 = function( monitoredItems )
        fromSetting               = function( settingName, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn )
        fromSettings              = function( settingNames, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn )
        toIdsArray                = function( MonitoredItems )
        Clone                     = function( MonitoredItems )
        SetBrowseOptions          = function( browseDirection, includeSubtypes, nodeClassMask, referenceTypeId, resultMask )
*/
function MonitoredItem( nodeId, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn, nodeSetting )
{
    if( arguments.length < 2 )
    {
        throw( "MonitoredItem(NodeId, ClientHandle) constructor requires 2 arguments by minimum, NodeId and ClientHandle." );
    }// if( arguments.length < 2 )

    // Core attributes
    this.NodeSetting = "";
    this.NodeId = null;
    this.ClientHandle = null;
    this.MonitoringMode = MonitoringMode.Reporting;
    this.MonitoredItemId = 0;
    this.IsCreated = false;
    this.DataType = null;
    this.Value = new UaDataValue();
    this.EURange = null;

    // Read() related attributes
    this.AttributeId = Attribute.Value;
    this.DataEncoding = new UaQualifiedName();

    // Array related properties
    this.IndexRange = "";
    this.IsArray = false;
    this.ArrayUpperBound = -1;

    // MonitoredItem related parameters
    this.DiscardOldest = true;
    this.Filter = null;
    this.QueueSize = 10;
    this.SamplingInterval = 0;
    this.RevisedSamplingInterval = 0;
    this.TimestampsToReturn = TimestampsToReturn.Both;

    // Subscription related parameters
    this.SubscriptionId = 0;

    // Browse related parameters
    this.BrowseDirection = BrowseDirection.Forward;
    this.IncludeSubtypes = false;
    this.NodeClass   = 0xff;
    this.ReferenceTypeId = null;
    this.ResultMask      = BrowseResultMask.All;
    this.ContinuationPoint = null;

    // OBJECT CONSTRUCTOR
    if( arguments.length > 0 )
    {
        if( nodeId                === undefined ) { throw( "[MonitoredItem] Argument error: nodeId cannot be invalid!" ); }
        if( nodeId.IdentifierType === undefined ) { throw( "[MonitoredItem] Argument error: nodeId does not appear to be of type NodeId" ); }
        if( clientHandle          === undefined ) { throw ("[MonitoredItem] Argument error: clientHandle is required." ); }

        this.NodeId = nodeId;
        this.ClientHandle = clientHandle;

        if( attributeId        !== undefined ) { this.AttributeId        = attributeId; }
        if( indexRange         !== undefined ) { this.IndexRange         = indexRange; }
        if( monitorMode        !== undefined ) { this.MonitoringMode     = monitorMode; } 
        if( discardOldest      !== undefined ) { this.DiscardOldest      = discardOldest; }
        if( filter             !== undefined ) { this.Filter             = filter; } 
        if( queue              !== undefined ) { this.QueueSize          = queue; }
        if( interval           !== undefined ) { this.SamplingInterval   = interval; }
        if( timestampsToReturn !== undefined ) { this.TimestampsToReturn = timestampsToReturn; }
        if( nodeSetting        !== undefined ) { this.NodeSetting        = nodeSetting; }
    }// if( arguments.length > 2 )

    // specifies all of the parameters needed for Browsing a Node.
    this.SetBrowse = function( direction, subtypes, classMask, referenceTypeId, resultsMask )
    {
        this.BrowseDirection = direction;
        this.IncludeSubtypes = subtypes;
        this.NodeClass   = classMask;
        this.ReferenceTypeId = referenceTypeId;
        this.ResultMask      = resultsMask;
    }

    this.toString = function()
    {
        var str = "MonitoredItemId: " + this.MonitoredItemId +
                "; NodeId: " + this.NodeId.toString() +
                "; ClientHandle: " + this.ClientHandle +
                "; AttributeId: " + this.AttributeId + 
                "; IndexRange: " + this.IndexRange + 
                "; DiscardOldest: " + this.DiscardOldest + 
                "; QueueSize: " + this.QueueSize + 
                "; SamplingInterval: " + this.SamplingInterval +
                "; TimestampsToReturn: " + this.TimestampsToReturn + 
                "; Filter: " + this.Filter;
        if( this.BrowseDirection !== undefined && this.BrowseDirection !== null ){ str += "\n\tBrowseDirection: " + this.BrowseDirection; }
        if( this.IncludeSubtypes !== undefined && this.IncludeSubtypes !== null ){ str += "; IncludeSubtypes: " + this.IncludeSubtypes; }
        if( this.NodeClass !== undefined && this.NodeClass !== null ){ str += "; NodeClassMask: " + this.NodeClass; }
        if( this.ReferenceTypeId !== undefined && this.ReferenceTypeId !== null ){ str += "; ReferenceTypeId: " + this.ReferenceTypeId; }
        if( this.ResultMask !== undefined && this.ResultMask !== null ){ str += "; ResultMask: " + this.ResultMask; }
        return( str );
    };

    // Clears the Value, Quality, timestampServer timestampDevice
    // e.g. ClearVQTT( "vqsd" );
    this.ClearVQTT = function( parameterString )
    {
        if( parameterString !== undefined && parameterString !== "" )
        {
            if( parameterString.toLowerCase().indexOf( "v" ) >= 0 )
            {
                print( "\tClearing item Value." );
                this.Value.Value = new UaVariant();
            }
            if( parameterString.toLowerCase().indexOf( "q" ) >= 0 )
            {
                print( "\tClearing item StatusCode." );
                this.Value.StatusCode.StatusCode = -1;
            }
            if( parameterString.toLowerCase().indexOf( "s" ) >= 0 )
            {
                print( "\tClearing item TimestampServer." );
                this.Value.TimestampServer = new UaDateTime();
            }
            if( parameterString.toLowerCase().indexOf( "d" ) >= 0 )
            {
                print( "\tClearing item TimestampServer." );
                this.Value.TimestampSource = new UaDateTime();
            }
        }
    }

    /*  Nathan Pocock; nathan.pocock@opcfoundation.org
        This function will set the value of the monitoredItem safely. It does this by correctly specifying the 
        data-type when setting value. A read is performed of the item first to retrieve the current value, which
        in turn will also provide the data-type information that we need to know.
        Function returns TRUE/FALSE to indicate success/fail.
    */
    this.SafelySetValueTypeUnknown = function( newValue, sessionObject )
    {
        if( arguments.length !== 2 ) { throw( "MonitoredItem.SafelySetValueTypeUnknown() argument count error." ); }
        if( newValue === null || newValue === undefined || sessionObject === undefined || sessionObject === null ) { throw ("MonitoredItem.SafelySetValueTypeUnknown() argument null error." ); }
        var result = true; //return code
        var readHelper = new Read( sessionObject );
        result = readHelper.Execute( this );
        if( result )
        {
            setValue( this, newValue, this.Value.Value.DataType );
        }
        return( result );
    };
    
    /*  Nathan Pocock; nathan.pocock@opcfoundation.org
        This function will correctly set the value of the node based on the specified data-type
    */
    this.SafelySetValueTypeKnown = function( newValue, dataType )
    {
        if( arguments.length !== 2 ) { throw( "MonitoredItem.SafelySetValueTypeKnown() argument count error." ); }
        if( newValue === null || newValue === undefined || dataType === null || dataType === undefined ) { throw ("MonitoredItem.SafelySetValueTypeKnown() argument null error. [NewValue]=" + newValue + "; [dataType]=" + dataType + " (" + BuiltInType.toString( dataType ) + ")" ); }
        setValue( this, newValue, dataType );
    };
    
    this.SafelySetArrayTypeKnown = function( newValue, dataType )
    {
        if( arguments.length !== 2 ) { throw( "MonitoredItem.SafelySetArrayTypeKnown() argument count error." ); }
        if( newValue === null || newValue === undefined || dataType === null || dataType === undefined ) { throw ("MonitoredItem.SafelySetArrayTypeKnown() argument null error." ); }
        setValue( this, newValue, dataType, true );
    };

    this.SetBrowseOptions = function( browseDirection, includeSubtypes, nodeClassMask, referenceTypeId, resultMask )
    {
        if( browseDirection !== null ){ this.BrowseDirection = browseDirection; }
        if( includeSubtypes !== null ){ this.IncludeSubtypes = includeSubtypes; }
        if( nodeClassMask   !== null ){ this.NodeClass   = nodeClassMask; }
        if( referenceTypeId !== null ){ this.ReferenceTypeId = referenceTypeId; }
        if( resultMask      !== null ){ this.ResultMask      = resultMask; }
    };

};


/*  Takes an array of Nodes (UaNodes) and returns an array of  MonitoredItems.
    Parameters: 
        - Nodes              - array of NodeIds.
        - AttributeId        - AttributeId value.
        - IndexRange         - IndexRange string.
        - MonitorMode        - MonitoringMode value.
        - DiscardOldest      - True/False to DiscardOldest.
        - Filter             - Filter value.
        - Queue              - QueueSize value.
        - Interval           - Interval value.
        - TimestampsToReturn - TimestampsToReturn value.
*/
MonitoredItem.fromNodeIds = function( Nodes, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn )
{
    if( arguments.length < 1 )
    {
        throw( "ERROR, 1 PARAMETER REQUIRED! 'fromNodeIds'" );
    }
    var monItems = [];
    if( Nodes !== null && Nodes !== undefined )
    {
        if( Nodes.length === undefined )
        {
            // nodes is not an array, so turn it into an array!
            Nodes = [Nodes];
        }
        
        for( var i=0; i<Nodes.length; i++ )
        {
            var newMI = new MonitoredItem( Nodes[i], i, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn );
            monItems.push( newMI );
        }
    }
    return monItems;
};

MonitoredItem.fromUaRefDescHelper = function( nodeId, browseDirection, includeSubTypes, helperObject )
{
    var m = new MonitoredItem( nodeId, 1 );
    m.BrowseDirection = browseDirection;
    m.IncludeSubtypes = includeSubTypes;
    m.NodeClass = helperObject.NodeClass;
    m.ReferenceTypeId = helperObject.ReferenceTypeId;
    return( m );
}

// takes an array of MonitoredItem objects and returns an array of NodeIds.
MonitoredItem.toNodeIds = function( monitoredItems )
{
    var nodeIds = [];
    if( monitoredItems !== undefined && monitoredItems !== null )
    {
        if( monitoredItems.length === undefined ){ monitoredItems = [monitoredItems]; }
        for( var mic=0; mic<monitoredItems.length; mic++ )
        {
            nodeIds.push( monitoredItems[mic].NodeId );
        }
    }
    return( nodeIds );
}

// Takes an array of MonitoredItems, and returns an array of JUST
// the monitoredItemIds (an array of Ints)
MonitoredItem.toIdsArray = function( MonitoredItems )
{
    var results = [];
    var currentPosition = 0;
    if( MonitoredItems !== undefined && MonitoredItems !== null )
    {
        if( MonitoredItems.length !== undefined )
        {
            for( var i=0; i<MonitoredItems.length; i++ )
            {
                results[currentPosition++] = MonitoredItems[i].MonitoredItemId;
            }
        }
    }
    return( results );
};

MonitoredItem.fromSetting = function( settingName, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn )
{
    var mi = null;
    if( arguments.length < 1 )
    {
        throw( "Invalid argument length. Must specify a SettingName." );
    }
    if( clientHandle === undefined || clientHandle === null || clientHandle === NaN )
    {
        clientHandle = __clientHandle;
    }
    var settingValue = readSetting( settingName );
    if( settingValue !== undefined )
    {
        settingValue = settingValue.toString();
    }
    if( settingValue !== undefined && settingValue !== "undefined" && settingValue.length > 0 )
    {
        mi = new MonitoredItem( new UaNodeId.fromString( settingValue ), clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn );
        mi.NodeSetting = settingName;
    }
    else
    {
        _warning.store( "Setting not configured: '" + settingName + "'.", undefined, true );
    }
    return( mi );
};

MonitoredItem.fromSettings = function( settingNames, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn, suppressWarnings, maxNumberNeeded )
{
    var mis = [];
    // make sure 'settingNames' is always an array!
    if( settingNames.push === undefined )
    {
        settingNames = [settingNames];
    }
    // make sure clientHandle is specified, if not then auto-generate the next
    if( clientHandle === undefined || clientHandle === null || clientHandle === NaN )
    {
        clientHandle = __clientHandle;
    }
    for( var s=0; s<settingNames.length; s++ )
    {
        var mi = MonitoredItem.fromSetting( settingNames[s], clientHandle++, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn, suppressWarnings );
        if( mi !== undefined && mi !== null )
        {
            mis.push( mi );
            __clientHandle++;
        }
    }
    if( maxNumberNeeded !== undefined && maxNumberNeeded !== null )
    {
        while( mis.length > maxNumberNeeded )
        {
            mis.pop();
        }
    }
    print( "\tMonitoredItem.fromSettings returning '" + mis.length + "' monitored item objects." );
    return( mis );
};

// Create a minimum number of MonitoredItems from the specified settings. Adds an error and
// returns null if the required number could not created.
MonitoredItem.createMinimumMonitoredItemsFromSettings = function( itemSettings, minimumSettings )
{
    var itemNodeIds = NodeIdSettings.getNodes( itemSettings, true );
    var items = this.fromNodeIds( itemNodeIds );
    if( items === null || items < minimumSettings )
    {
        addWarning( "Not enough settings configured. At least " + minimumSettings + " settings must be configured in " + ArrayToFormattedString( NodeIdSettings.GetUniqueSettingsParents( itemSettings ), "and" ) );
        items = null;
    }
    return items;
};

MonitoredItem.getMaxNoOfMIs = function( nodeIdsFunctionPointer, maxNumberNeeded )
{
    if( maxNumberNeeded === undefined || maxNumberNeeded === null )
    {
        maxNumberNeeded = 100;
    }

    var items = this.fromSettings( nodeIdsFunctionPointer );
    while( items.length > maxNumberNeeded )
    {
        items.pop(); // removes the first item from the array
    }
    return( items );
};

// Returns a duplicate of the specified MonitoredItem(s)
MonitoredItem.Clone = function( MonitoredItems )
{
    // validate arguments
    if( MonitoredItems === undefined || MonitoredItems === null )
    {
        return( null );
    }
    // single item?
    if( MonitoredItems.MonitoredItemId !== undefined )
    {
        var newMi = new MonitoredItem( MonitoredItems.NodeId, MonitoredItems.ClientHandle, MonitoredItems.AttributeId,
            MonitoredItems.IndexRange, MonitoredItems.MonitoringMode, MonitoredItems.DiscardOldest,
            MonitoredItems.Filter, MonitoredItems.QueueSize, MonitoredItems.SamplingInterval, 
            MonitoredItems.TimestampsToReturn, MonitoredItems.NodeSetting );
        newMi.DataType = MonitoredItems.DataType;
        return( newMi );
    }
    else if( MonitoredItems.length !== undefined )
    {
        var mis = [];
        for( var m=0; m<MonitoredItems.length; m++ )
        {
            mis[m] = new MonitoredItem( MonitoredItems[m].NodeId, MonitoredItems[m].ClientHandle,
            MonitoredItems[m].AttributeId, MonitoredItems[m].IndexRange, MonitoredItems[m].MonitoringMode,
            MonitoredItems[m].DiscardOldest, MonitoredItems[m].Filter, MonitoredItems[m].QueueSize,
            MonitoredItems[m].SamplingInterval, MonitoredItems[m].TimestampsToReturn, MonitoredItems[m].NodeSetting );
            mis[m].DataType = MonitoredItems[m].DataType;
        }
        return( mis );
    }
    else
    {
        return( null );
    }
};

// Returns an array of strings where each string contains the settingName for each 
// monitoredItem specified in the parameter
MonitoredItem.GetSettingNames = function( MonitoredItems )
{
    var results = [];
    if( MonitoredItems !== undefined && MonitoredItems !== null )
    {
        if( MonitoredItems.length === undefined )
        {
            // turn this into an array
            MonitoredItems = [MonitoredItems];
        }
        for( var i=0; i<MonitoredItems.length; i++ )
        {
            results[i] = MonitoredItems[i].NodeSetting;
        }
    }
    return( results );
};

function setValue( node, newValue, dataType, isArray )
{
    if( isArray === undefined || isArray === false )
    {
        switch( dataType )
        {
            case BuiltInType.Boolean:
                node.Value.Value.setBoolean( newValue );
                break;
            case BuiltInType.Byte:
                node.Value.Value.setByte( newValue );
                break;
            case BuiltInType.ByteString:
                node.Value.Value.setByteString( newValue );
                break;
            case BuiltInType.SByte:
                node.Value.Value.setSByte( newValue );
                break;
            case BuiltInType.Int16:
                node.Value.Value.setInt16( newValue );
                break;
            case BuiltInType.Int32:
                node.Value.Value.setInt32( newValue );
                break;
            case BuiltInType.Int64:
                node.Value.Value.setInt64( newValue );
                break;
            case BuiltInType.UInt16:
                node.Value.Value.setUInt16( newValue );
                break;
            case BuiltInType.UInt32:
                node.Value.Value.setUInt32( newValue );
                break;
            case BuiltInType.UInt64:
                node.Value.Value.setUInt64( newValue );
                break;
            case BuiltInType.Double:
                node.Value.Value.setDouble( newValue );
                break;
            case BuiltInType.Duration:
                node.Value.Value.setDuration( newValue );
                break;
            case BuiltInType.Float:
                node.Value.Value.setFloat( newValue );
                break;
            case BuiltInType.Guid:
                node.Value.Value.setGuid( newValue );
                break;
            case BuiltInType.DateTime:
                if( newValue === 0 )
                {
                    newValue = UaDateTime.utcNow();
                }
                node.Value.Value.setDateTime( newValue );
                break;
            case BuiltInType.String:
                node.Value.Value.setString( newValue );
                break;
            case BuiltInType.ExtensionObject:
                node.Value.Value.setExtensionObject( newValue );
                break;
            case BuiltInType.XmlElement:
                node.Value.Value.setXmlElement( newValue );
                break;
            default:
                addError( "Invalid data-type: '" + dataType + "' (" + BuiltInType.toString( dataType ) + "). Value is unchanged." );
        }
    }
    else
    {
        // make sure the newValue is an array, if not then force it to become one
        if( newValue.length === undefined ){ newValue = [newValue]; }
        switch( dataType )
        {
            case BuiltInType.Boolean:
                var x = new UaBooleans();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setBooleanArray( x );
                break;
            case BuiltInType.Byte:
                node.Value.Value.setByteString( newValue );
                break;
            case BuiltInType.ByteString:
                node.Value.Value.setByteStringArray( newValue );
                break;
            case BuiltInType.SByte:
                var x = new UaSBytes();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setSByteArray( newValue );
                break;
            case BuiltInType.Int16:
                var x = new UaInt16s();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setInt16Array( x );
                break;
            case BuiltInType.Int32:
                var x = new UaInt32s();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setInt32Array( x );
                break;
            case BuiltInType.Int64:
                var x = new UaInt64s();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setInt64Array( x );
                break;
            case BuiltInType.UInt16:
                var x = new UaUInt16s();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setUInt16Array( x );
                break;
            case BuiltInType.UInt32:
                var x = new UaUInt32s();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setUInt32Array( x );
                break;
            case BuiltInType.UInt64:
                var x = new UaUInt64s();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setUInt64Array( x );
                break;
            case BuiltInType.Double:
                var x = new UaDoubles();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setDoubleArray( x );
                break;
            case BuiltInType.Duration:
                node.Value.Value.setDurationArray( newValue );
                break;
            case BuiltInType.Float:
                var x = new UaFloats();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setFloatArray( x );
                break;
            case BuiltInType.DateTime:
                if( newValue === 0 )
                {
                    newValue = UaDateTime.utcNow();
                }
                var x = new UaDateTimes();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setDateTimeArray( x );
                break;
            case BuiltInType.String:
                var x = new UaStrings();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setStringArray( x );
                break;
            case BuiltInType.ExtensionObject:
                node.Value.Value.setExtensionObject( newValue );
                break;
            case BuiltInType.XmlElement:
                var x = new UaXmlElements();
                for( var i=0; i<newValue.length; i++ ){ x[i] = newValue[i]; }
                node.Value.Value.setXmlElementArray( x );
                break;
            default:
                addError( "Invalid Array data-type: '" + dataType + "' (" + BuiltInType.toString( dataType ) + "). No value set (leaving existing value in place)." );
        }
    }
}



/* TESTING
function MonitoredItem( nodeId, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn )
// no params, should fault
include( "./library/Base/assertions.js" );
try{var m=new MonitoredItem();print("success????");}catch(exception){print( "Exception, as expected" );}
// 1 param, should fault
try{var m=new MonitoredItem( new UaNodeId( Identifier.Server, 0 ) );;print("success :(");}catch(exception){print( "Exception, as expected" );}
// 2 params, should work
try{var m=new MonitoredItem( new UaNodeId( Identifier.Server, 0 ), 0 );AssertNotNullOrEmpty(m.NodeId,"NodeId");AssertEqual(0, m.ClientHandle);}catch(exception){print("Failed: ClientHandle");}
// 3 params, should work
try{var m=new MonitoredItem( new UaNodeId( Identifier.Server, 0 ), 0, Attribute.Value );AssertNotNullOrEmpty(m.NodeId,"NodeId");AssertEqual(Attribute.Value, m.AttributeId);}catch(exception){print("Failed: Attribute.Value");}
// 4 params, should work
try{var m=new MonitoredItem( new UaNodeId( Identifier.Server, 0 ), 0, Attribute.Value, "1:2" );AssertNotNullOrEmpty(m.NodeId,"NodeId");AssertEqual(0, m.ClientHandle);AssertEqual(Attribute.Value, m.AttributeId);AssertEqual("1:2",m.IndexRange);}catch(exception){print("Failed???");}
// 5 params, should work
try{var m=new MonitoredItem( new UaNodeId( Identifier.Server, 0 ), 0, Attribute.Value, "1:2", MonitoringMode.Reporting );AssertNotNullOrEmpty(m.NodeId,"NodeId");AssertEqual(0, m.ClientHandle);AssertEqual(Attribute.Value, m.AttributeId);AssertEqual("1:2",m.IndexRange);AssertEqual(MonitoringMode.Reporting, m.MonitoringMode);}catch(exception){print("Failed???");}
// 6 params, should work
try{var m=new MonitoredItem( new UaNodeId( Identifier.Server, 0 ), 0, Attribute.Value, "1:2", MonitoringMode.Reporting, true );AssertNotNullOrEmpty(m.NodeId,"NodeId");AssertEqual(0, m.ClientHandle);AssertEqual(Attribute.Value, m.AttributeId);AssertEqual("1:2",m.IndexRange);AssertEqual(MonitoringMode.Reporting, m.MonitoringMode);AssertEqual(true, m.DiscardOldest);}catch(exception){print("Failed???");}
// 7 params, should work
try{var m=new MonitoredItem( new UaNodeId( Identifier.Server, 0 ), 0, Attribute.Value, "1:2", MonitoringMode.Reporting, true, "filter");AssertNotNullOrEmpty(m.NodeId,"NodeId");AssertEqual(0, m.ClientHandle);AssertEqual(Attribute.Value, m.AttributeId);AssertEqual("1:2",m.IndexRange);AssertEqual(MonitoringMode.Reporting, m.MonitoringMode);AssertEqual(true, m.DiscardOldest);AssertEqual("filter",m.Filter);}catch(exception){print("Failed???");}
// 8 params, should work
try{var m=new MonitoredItem( new UaNodeId( Identifier.Server, 0 ), 0, Attribute.Value, "1:2", MonitoringMode.Reporting, true, "filter", 10);AssertNotNullOrEmpty(m.NodeId,"NodeId");AssertEqual(0, m.ClientHandle);AssertEqual(Attribute.Value, m.AttributeId);AssertEqual("1:2",m.IndexRange);AssertEqual(MonitoringMode.Reporting, m.MonitoringMode);AssertEqual(true, m.DiscardOldest);AssertEqual("filter",m.Filter);AssertEqual(10,m.QueueSize);}catch(exception){print("Failed???");}
// 9 params, should work
try{var m=new MonitoredItem( new UaNodeId( Identifier.Server, 0 ), 0, Attribute.Value, "1:2", MonitoringMode.Reporting, true, "filter", 10, 1000);AssertNotNullOrEmpty(m.NodeId,"NodeId");AssertEqual(0, m.ClientHandle);AssertEqual(Attribute.Value, m.AttributeId);AssertEqual("1:2",m.IndexRange);AssertEqual(MonitoringMode.Reporting, m.MonitoringMode);AssertEqual(true, m.DiscardOldest);AssertEqual("filter",m.Filter);AssertEqual(10,m.QueueSize);AssertEqual(1000,m.SamplingInterval);}catch(exception){print("Failed???");}
// 10 params, should work
try{var m=new MonitoredItem( new UaNodeId( Identifier.Server, 0 ), 0, Attribute.Value, "1:2", MonitoringMode.Reporting, true, "filter", 10, 1000, TimestampsToReturn.Both);AssertNotNullOrEmpty(m.NodeId,"NodeId");AssertEqual(0, m.ClientHandle);AssertEqual(Attribute.Value, m.AttributeId);AssertEqual("1:2",m.IndexRange);AssertEqual(MonitoringMode.Reporting, m.MonitoringMode);AssertEqual(true, m.DiscardOldest);AssertEqual("filter",m.Filter);AssertEqual(10,m.QueueSize);AssertEqual(1000,m.SamplingInterval);AssertEqual(TimestampsToReturn.Both,m.TimestampsToReturn);}catch(exception){print("Failed???");}
*/