/* All functions within this script exist to create new instances of core script library objects
   in as little as one line of code.

   Helper functions available:

    - GetAggregateConfiguration( useDefaults, uncertainAsBad, percentBad, percentGood, useSloped )
    - GetAggregateFilter( startTime, aggregateType, processingInterval, aggregateConfig )
    - GetAnnotation( message, username, time )
    - GetDeleteAtTimeDetails( nodeId, times )
    - GetDeleteEventDetails( eventIds, nodeId )
    - GetDeleteRawModifiedDetails( nodeId, isDeleteModified, startTime, endTime )
    - GetHistoryEventFieldList( eventFields )
    - GetHistoryUpdateDetails( nodeId )
    - GetModificationInfo( time, type, username )
    - GetReadRawModifiedDetails( isReadModified, startTime, endTime, numValuesPerNode, returnBounds )
    - GetReadEventDetails( numValuesPerNode, startTime, endTime, filter )
    - GetReadProcessedDetails( startTime, endTime, resampleInterval, aggregateType, aggregateConfiguration )
    - GetReadAtTime( times )
    - GetReadEventDetails( numValuesPerNode, startTime, endTime, filter )
    - GetReadProcessedDetails( startTime, endTime, resampleInterval, aggregateType, aggregateConfiguration )
    - GetUpdateDataDetails( nodeId, performInsert, values )
    - GetUpdateEventDetails( nodeId, performInsert, filter, eventData )
    - GetUpdateStructureDataDetails( nodeId, performInsert, values )
*/

// Returns a UaAggregateConfiguration structure.
// Parameters are in the same order as defined in UA Spec Part 13.
function GetAggregateConfiguration( useDefaults, uncertainAsBad, percentBad, percentGood, useSloped )
{
    // validate parameters
    if( useDefaults    === undefined || useDefaults === null )   { throw( "GetUaAggregateConfiguration.useDefaults missing." ); }
    if( uncertainAsBad === undefined || uncertainAsBad === null ){ throw( "GetUaAggregateConfiguration.uncertainAsBad missing." ); }
    if( percentBad     === undefined || percentBad === null )    { throw( "GetUaAggregateConfiguration.percentBad missing." ); }
    if( percentGood    === undefined || percentGood === null )   { throw( "GetUaAggregateConfiguration.percentGood missing." ); }
    if( useSloped      === undefined || useSloped === null )     { throw( "GetUaAggregateConfiguration.useSloped missing." ); }
    // create the object
    var uaObj = new UaAggregateConfiguration();
    uaObj.UseServerCapabilitiesDefaults = useDefaults;
    uaObj.TreatUncertainAsBad = uncertainAsBad;
    uaObj.PercentDataBad = percentBad;
    uaObj.PercentDataGood = percentGood;
    uaObj.UseSlopedExtrapolation = useSloped;
    // return object
    return( uaObj );
}

// Returns a UaAggregateFilter structure.
// Parameters are in the same order as defined in UA Spec Part 13.
// "aggregateConfig" parameter value should come from calling "GetUaAggregateConfiguration()" (above)
function GetAggregateFilter( startTime, aggregateType, processingInterval, aggregateConfig )
{
    if( startTime          === undefined || startTime === null )         { throw( "GetUaAggregateFilter.startTime missing." ); }
    if( aggregateType      === undefined || aggregateType === null )     { throw( "GetUaAggregateFilter.aggregateType missing." ); }
    if( processingInterval === undefined || processingInterval === null ){ throw( "GetUaAggregateFilter.processingInterval missing." ); }
    if( aggregateConfig    === undefined || aggregateConfig === null )   { throw( "GetUaAggregateFilter.aggregateConfig missing." ); }
    // create the object
    var uaObj = new UaAggregateFilter();
    uaObj.StartTime = startTime;
    uaObj.AggregateType = aggregateType;
    uaObj.ProcessingInterval = processingInterval;
    uaObj.AggregateConfiguration = aggregateConfig;
    // return object
    return( uaObj );
}

// Returns a UaAnnotation structure.
// Parameters are in the same order as defined in UA Spec Part 11.
function GetAnnotation( message, username, time )
{
    if( message  === undefined || message === null ) { throw( "GetUaAnnotation.message missing." ); }
    if( username === undefined || username === null ){ throw( "GetUaAnnotation.username missing." ); }
    if( time     === undefined || time === null )    { throw( "GetUaAnnotation.time missing." ); }
    // create the object
    var uaObj = new UaAnnotation();
    uaObj.Message = message;
    uaObj.UserName  = message;
    uaObj.AnnotationTime = time;
    // return object
    return( uaObj );
}

// Returns a UaDeleteAtTimeDetails structure.
// Parameters are in the same order as defined in UA Spec Part 11.
function GetDeleteAtTimeDetails( nodeId, times )
{
    if( nodeId  === undefined || nodeId === null ) { throw( "GetUaDeleteAtTimeDetails.nodeId missing." ); }
    if( times === undefined || times === null ){ throw( "GetUaDeleteAtTimeDetails.times missing." ); }
    // create the object
    var uaObj = new UaDeleteAtTimeDetails();
    uaObj.NodeId = nodeId;
    uaObj.ReqTimes = times;
    // return object
    return( uaObj );
}

// Returns a UaDeleteAtTimeDetails structure.
// Parameters are in the same order as defined in UA Spec Part 11.
function GetDeleteEventDetails( eventIds, nodeId )
{
    if( eventIds  === undefined || eventIds === null ) { throw( "GetDeleteEventDetails.nodeId missing." ); }
    if( nodeId === undefined || nodeId === null ){ throw( "GetDeleteEventDetails.times missing." ); }
    // create the object
    var uaObj = new UaDeleteEventDetails();
    uaObj.EventIds = eventIds;
    uaObj.NodeId = nodeId;
    // return object
    return( uaObj );
}

// Helper function to assist with the creation of a ReadRawModifiedDetails object.
function GetReadRawModifiedDetails( isReadModified, startTime, endTime, numValuesPerNode, returnBounds )
{
    // validate parameters
    if( isReadModified === undefined || isReadModified === null ){ throw( "GetReadRawModifiedDetails.isReadModified missing." ); }
    if( startTime === undefined || startTime === null ){ throw( "GetReadRawModifiedDetails.startTime is missing." ); }
    if( endTime === undefined || endTime === null ){ throw( "GetReadRawModifiedDetails.endTime is missing." ); }
    if( numValuesPerNode === undefined || numValuesPerNode === null ){ throw( "GetReadRawModifiedDetails.numValuesPerNode is missing." ); }
    if( returnBounds === undefined || returnBounds === null ){ throw( "GetReadRawModifiedDetails.returnBounds is missing." ); }
    // create the object
    var uaObj = new UaReadRawModifiedDetails();
    uaObj.IsReadModified   = isReadModified;
    uaObj.StartTime        = startTime;
    uaObj.EndTime          = endTime;
    uaObj.NumValuesPerNode = numValuesPerNode;
    uaObj.ReturnBounds     = returnBounds;
    // return object
    return( uaObj );
}

// Helper function to assist with the creation of a ReadDeleteRawModifiedDetails object.
function GetDeleteRawModifiedDetails( nodeId, isDeleteModified, startTime, endTime )
{
    // validate parameters
    if( nodeId === undefined || nodeId === null ){ throw( "GetDeleteRawModifiedDetails.nodeId missing." ); }
    if( isDeleteModified === undefined || isDeleteModified === null ){ throw( "GetDeleteRawModifiedDetails.isDeleteModified is missing." ); }
    if( startTime === undefined || startTime === null ){ throw( "GetDeleteRawModifiedDetails.startTime is missing." ); }
    if( endTime === undefined || endTime === null ){ throw( "GetDeleteRawModifiedDetails.endTime is missing." ); }
    // create the object
    var uaObj = new UaDeleteRawModifiedDetails();
    uaObj.IsDeleteModified = isReadModified;
    uaObj.StartTime = startTime;
    uaObj.EndTime = endTime;
    uaObj.NodeId = nodeId;
    // return object
    return( uaObj );
}

// Helper function to assist with the creation of a HistoryEventFieldList object.
function GetHistoryEventFieldList( eventFields )
{
    // validate parameters
    if( eventFields === undefined || eventFields === null ){ throw( "GetHistoryEventFieldList.eventFields missing." ); }
    // create the object
    var uaObj = new UaHistoryEventFieldList();
    uaObj.EventFields = eventFields;
    // return object
    return( uaObj );
}

// Helper function to assist with the creation of a HistoryUpdateDetails object.
function GetHistoryUpdateDetails( nodeId )
{
    // validate parameters
    if( nodeId === undefined || nodeId === null ){ throw( "GetHistoryUpdateDetails.nodeId missing." ); }
    // create the object
    var uaObj = new UaHistoryUpdateDetails();
    uaObj.NodeId = nodeId;
    // return object
    return( uaObj );
}

// Helper function to assist with the creation of a ModificationInfo object.
function GetModificationInfo( time, type, username )
{
    // validate parameters
    if( time === undefined || time === null ){ throw( "GetModificationInfo.time missing." ); }
    if( type === undefined || type === null ){ throw( "GetModificationInfo.type missing." ); }
    if( username === undefined || username === null ){ throw( "GetModificationInfo.username missing." ); }
    // create the object
    var uaObj = new UaModificationInfo();
    uaObj.ModificationTime = time;
    uaObj.UpdateType = type;
    uaObj.UserName = username;
    // return object
    return( uaObj );
}

function GetReadAtTimeDetails( times )
{
    if( times === undefined || times === null ){ throw( "GetReadAtTimeDetails.times is missing." ); }
    // create the object
    var uaObj = new UaReadAtTimeDetails();
    uaObj.ReqTimes = times;
    // return object
    return( uaObj );
}

function GetReadEventDetails( numValuesPerNode, startTime, endTime, filter )
{
    if( numValuesPerNode === undefined || numValuesPerNode === null ){ throw( "GetReadEventDetails.numValuesPerNode is missing." ); }
    if( startTime === undefined || startTime === null ){ throw( "GetReadEventDetails.startTime is missing." ); }
    if( endTime === undefined || endTime === null ){ throw( "GetReadEventDetails.endTime is missing." ); }
    if( filter === undefined || filter === null ){ throw( "GetReadEventDetails.filter is missing." ); }
    // create the object
    var uaObj = newUaReadEventDetails();
    uaObj.NumValuesPerNode = numValuesPerNode;
    uaObj.StartTime = startTime;
    uaObj.EndTime = endTime;
    uaObj.Filter = filter;
    // return object
    return( uaObj );
}

// Helper function to return ReadProcessedDetails structure
function GetReadProcessedDetails( startTime, endTime, resampleInterval, aggregateType, aggregateConfiguration )
{
    if( startTime === undefined || startTime === null ){ throw( "GetReadProcessedDetails.startTime is missing." ); }
    if( endTime === undefined || endTime === null ){ throw( "GetReadProcessedDetails.endTime is missing." ); }
    if( resampleInterval === undefined || resampleInterval === null ){ throw( "GetReadProcessedDetails.resampleInterval is missing." ); }
    if( aggregateType === undefined || aggregateType === null ){ throw( "GetReadProcessedDetails.aggregateType is missing." ); }
    if( aggregateConfiguration === undefined || aggregateConfiguration === null ){ throw( "GetReadProcessedDetails.aggregateConfiguration is missing." ); }
    // create the object
    var uaObj = UaReadProcessedDetails();
    uaObj.StartTime = startTime;
    uaObj.EndTime = endTime;
    uaObj.ProcessingInterval = resampleInterval;
    uaObj.AggregateType = aggregateType;
    uaObj.AggregateConfiguration = aggregateConfiguration;
    // return object
    return( uaObj );
}

// Helper function to return UpdateDataDetails structure
function GetUpdateDataDetails( nodeId, performInsert, values )
{
    if( nodeId === undefined || nodeId === null ){ throw( "GetUpdateDataDetails.nodeId is missing." ); }
    if( performInsert === undefined || performInsert === null ){ throw( "GetUpdateDataDetails.performInsert is missing." ); }
    if( values === undefined || values === null ){ throw( "GetUpdateDataDetails.values is missing." ); }
    // create the object
    var uaObj = UaUpdateDataDetails();
    uaObj.NodeId = nodeId;
    uaObj.PerformInsertReplace = performInsert;
    uaObj.UpdateValues = values;
    // return object
    return( uaObj );
}

// Helper function to return UpdateEventDetails structure
function GetUpdateEventDetails( nodeId, performInsert, filter, eventData )
{
    if( nodeId === undefined || nodeId === null ){ throw( "GetUpdateEventDetails.nodeId is missing." ); }
    if( performInsert === undefined || performInsert === null ){ throw( "GetUpdateEventDetails.performInsert is missing." ); }
    if( filter === undefined || filter === null ){ throw( "GetUpdateEventDetails.filter is missing." ); }
    if( eventData === undefined || eventData === null ){ throw( "GetUpdateEventDetails.eventData is missing." ); }
    // create the object
    var uaObj = UaUpdateDataDetails();
    uaObj.NodeId = nodeId;
    uaObj.PerformInsertReplace = performInsert;
    uaObj.Filter = filter;
    uaObj.EventData = eventData;
    // return object
    return( uaObj );
}

// Helper function to return UpdateStructureDataDetails structure
function GetUpdateStructureDataDetails( nodeId, performInsert, values )
{
    if( nodeId === undefined || nodeId === null ){ throw( "GetUpdateStructureDataDetails.nodeId is missing." ); }
    if( performInsert === undefined || performInsert === null ){ throw( "GetUpdateStructureDataDetails.performInsert is missing." ); }
    if( values === undefined || values === null ){ throw( "GetUpdateStructureDataDetails.values is missing." ); }
    // create the object
    var uaObj = UaUpdateStructureDataDetails();
    uaObj.NodeId = nodeId;
    uaObj.PerformInsertReplace = performInsert;
    uaObj.UpdateValues = values;
    // return object
    return( uaObj );
}